<script setup>
import moment from "moment";
const presentYear = ref(moment(new Date()).format("YYYY"));
</script>
<template>
  <div class="">
    <div class="bg-green-900 p-3">
      <h2 class="text-center text-white text-xs leading-0">
        <span class="font-bold mr-2">Copyright © {{ presentYear }} </span
        ><span>La Salle University Ozamiz, Inc.</span>
      </h2>
      <a
        href="/npcc"
        class="text-[9px] text-center text-white w-fit mx-auto flex whitespace-nowrap"
      >
        Powered by
        <span class="font-bold ml-0.5">
          Network, Programs and Computerization Center (NPCC)
        </span>
      </a>
    </div>
  </div>
</template>
