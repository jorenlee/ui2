<script setup>
  import moment from "moment";
  const presentYear = ref(moment(new Date()).format("YYYY"));
  const profileImageUrl = "https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/LSU%20Seal.PNG";
</script>
<template>
  <div class="">
    <UniversityFeedbackWidget />
    <div class="flex justify-between bg-green-900 px-3 py-1.5">
      <div class="flex gap-x-3 lg:w-fit mx-auto">
        <div class="flex items-center">
          <img :src="profileImageUrl" class="w-6 h-6 mx-auto" />
        </div>
        <div class="w-full flex items-center">
          <div>
            <h2 class="text-left text-white text-[10px] leading-0 whitespace-nowrap">
              <span class="mr-1"><span class="font-bold">LSU Central</span> | 
            
            <span class="font-bold">Copyright © {{ presentYear }}</span>
            </span>
              <span>La Salle University Ozamiz, Inc.</span>
            </h2>
            <a
              href="/npcc"
              class="text-[9px] text-center text-white w-fit mx-auto flex whitespace-nowrap"
            >
              Powered by
              <span class="font-bold ml-1">
                Network, Programs and Computerization Center (NPCC)
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>