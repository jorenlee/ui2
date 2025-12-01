<script setup>
// defineProps(["goToList", "goToCreate"]);
</script>
<template>
  <div class="min-h-[570px]">
    <div class="w-fit mx-auto mt-5 mb-3">
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSULRC.jpg"
        class="lg:w-24 w-20 mx-auto rounded-full"
      />
    </div>
    <div class="text-center">
      <h2 class="font-bold text-green-800 text-lg">Learning Resource Center</h2>
    </div>
    <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
      <a
        href="/library/dashboard/appointment"
        class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
      >
        <i class="fa fa-list mr-3" aria-hidden="true"></i>
        Appointment Lists
      </a>

      <a
        href="/library/dashboard/appointment/reports/books"
        class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
      >
        <i class="fa fa-book mr-3" aria-hidden="true"></i>
        Available Books
      </a>

      <!-- <a
        href="/library/dashboard/appointment/create"
        class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
      >
        <i class="fa fa-plus-circle mr-3"></i>
        Walk-Ins appointment
      </a> -->

      <a
        href="/library/dashboard/appointment/set-schedules"
        class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
      >
        <i class="fa fa-calendar mr-3.5" aria-hidden="true"></i> SET SCHEDULES
      </a>
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
