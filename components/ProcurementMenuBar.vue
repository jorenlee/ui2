<script setup>
 defineProps(['goToList', 'goToCreate'])

</script>
<template>
    <div>
        <div class="w-fit mx-auto mt-5 mb-3">
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSU_Seal.PNG"
            class="lg:w-24 w-20 mx-auto"
          />
        </div>

        <div class="text-center">
          <h1 class="font-bold text-green-800 text-3xl">Welcome!</h1>
          <h2 class="font-bold text-green-800 text-lg">
            Procurement's Admin Portal
          </h2>
        </div>

        <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
          <button
            @click="goToList"
            class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            
          >
          <i class="fa fa-list mr-3" aria-hidden="true"></i> 
            procurement list
          </button>

          <button
            @click="goToCreate"
            class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
           
          >
          <i class="fa fa-plus-circle mr-3" aria-hidden="true"></i> 
            CREATE
          </button>

          <a
            href="/"
            class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
          >
          <i class="fa fa-globe mr-3" aria-hidden="true"></i>
            LSU HOME PAGE
          </a>
        </div>
    </div>
</template>