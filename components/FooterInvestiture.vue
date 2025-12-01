<script setup>
  import moment from "moment";
  const presentYear = ref(moment(new Date()).format("YYYY"));
</script>


<template>
    <div class="lg:text-sm text-xs font-montserrat bg-white">
        <div class="h-0.5 bg-gray-100 mx-auto"></div>
        <div class="lg:pb-2 my-5">
            <div>
            <div class="text-center mb-4">
                <a href="/investiture/donation/dashboard" class="mx-10 hover:underline text-xs uppercase">Dashboard</a>
            </div>
        </div>
        <div class="text-center w-fit mx-auto">
            <span class="lg:flex">
                <span class="lg:flex block">© Copyright All Rights Reserved {{presentYear}}</span> 
            
            <span class="lg:flex hidden mx-1">|</span>
            
            <span class="lg:flex block">La Salle University-Ozamiz, Inc.</span> 
            </span>
            
           <span class="block">Network, Programs and Computerization Center</span>
        </div>
        <a href="mailto:dev@lsu.edu.ph" class="text-xs text-center font-light block">
            dev@lsu.edu.ph
        </a>
        </div>
    </div>
</template>