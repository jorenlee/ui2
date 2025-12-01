<script setup>
const router = useRouter();

import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
  const route = useRoute();
  const endpoint = ref(userStore.mainDevServer);
  const procurements = await $fetch(endpoint.value + "/api/procurements/" + route.params.id + "/").catch((error) => error.data)

</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div>
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
              LSU Central Procurement Unit
            </h1>
          </div>
          <div class="shadow-lg">
            <div class="w-11/12 mx-auto flex">
              <ul
                class="flex pt-2.5 pb-3 w-full lasalle-green-text capitalize mx-auto text-xs"
              >
                <li>
                  <a href="/" class="mr-1 hover:font-bold"> Home </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="/procurement" class="mr-1 hover:font-bold"> Procurement </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="#" class="mr-1"> Detail </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="w-11/12 lg:py-8 py-4 mx-auto">

      
        <div class="lg:flex mx-auto lg:text-left md:text-center gap-10">
          <div class="w-3/12 lg:mb-0 mb-5">
            <img :src="procurements.banner_image" class="w-full h-full" />
          </div>
          <div class="mx-auto w-full">
            <div class="flex items-center">
              <div class="text-sm">
                <div class="flex">
                  <h1 class="text-right mr-5 lg:w-7/12 font-bold">Title :</h1>
                  <span class="w-9/12 mb-3 uppercase">{{ procurements.title }}</span>
                </div>
                <div class="flex">
                  <h1 class="mr-5 text-right lg:w-7/12 font-bold">
                    LSU Address:
                  </h1>
                  <span class="w-9/12 mb-3 justify-end">
                    {{ procurements.lsu_address }}
                  </span>
                </div>
                <div class="flex">
                  <h1 class="text-right mr-5 lg:w-7/12 font-bold">Start Date:</h1>
                  <span class="w-9/12 mb-3">{{ procurements.start_date }}</span>
                </div>
                <div class="flex">
                  <h1 class="text-right mr-5 lg:w-7/12 font-bold">Deadline:</h1>
                  <span class="w-9/12 mb-3">{{ procurements.deadline }}</span>
                </div>
                <div class="flex">
                  <h1 class="text-right mr-5 lg:w-7/12 font-bold">Lead Time:</h1>
                  <span class="w-9/12 mb-3">{{ procurements.lead_time }}</span>
                </div>
                <div class="flex">
                  <h1 class="text-right mr-5 lg:w-7/12 font-bold">
                    Project Ceiling Budget:
                  </h1>
                  <span class="w-9/12 mb-3">{{ procurements.project_ceiling_budget }}</span>
                </div>
                <div class="flex">
                  <h1 class="text-right mr-5 lg:w-7/12 font-bold">Quantity:</h1>
                  <span class="w-9/12 mb-3">{{ procurements.quantity }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>
<style scoped></style>
