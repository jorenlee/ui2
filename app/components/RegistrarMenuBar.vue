<script setup>
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
      <h2 class="font-bold text-green-800 text-lg">Registrar's Portal</h2>
    </div>

    <div class="mx-auto mt-10 mb-5 grid grid-cols-1 px-5 w-fit">
      <a 
        href="/registrar"
      
        class="flex text-xs mx-auto mb-2 w-full uppercase px-5 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white p-1"
      >
        <i class="fa fa-list mr-4" aria-hidden="true"></i> 
        <span class="-mt-1">Dashboard</span>
      </a>

      <a 
        href="/registrar"
      
        class="flex text-xs mx-auto mb-2 w-full uppercase px-5 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white p-1"
      >
        <i class="fa fa-list mr-4" aria-hidden="true"></i> 
        <span class="-mt-1">Appointments</span>
      </a>
      
      <a 
        href="/registrar"
       
        class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
      >
         <i class="fa fa-list mr-3" aria-hidden="true"></i>  Enrollees
      </a>

      <a 
        href="/registrar"
     
        class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
      >
        <i class="fa fa-calendar mr-3" aria-hidden="true"></i> SET SCHEDULES
      </a>
      <a
        href="/"
        class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
      >
        <i class="fa fa-globe mr-3" aria-hidden="true"></i> LSU HOME PAGE
      </a>
    </div>
  </div>
</template>