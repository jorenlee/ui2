<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- HEADER -->
    <header class="px-6 pt-6 pb-4">
      <h1 class="text-xl font-bold text-green-900">
        University Dashboard
      </h1>
      <p class="text-sm text-gray-600">
        Welcome to your student portal
      </p>
    </header>

    <!-- MAIN CONTENT -->
    <main class="flex-1 px-6">
      <div class="mt-6 bg-white rounded-xl shadow p-6 text-gray-500 text-sm">
        Dashboard content goes here…
      </div>
    </main>

    <!-- BOTTOM NAV -->
    <nav
      class="fixed bottom-0 left-0 right-0
             bg-white border-t shadow-lg
             rounded-t-2xl py-3"
    >
      <div class="flex justify-evenly items-center">
        <!-- PORTFOLIO -->
        <button
          @click="active = 'Portfolio'"
          class="flex flex-col items-center text-xs"
          :class="active === 'Portfolio' ? 'text-green-900' : 'text-gray-400'"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl mb-1"
            :class="active === 'Portfolio' ? 'bg-green-100' : ''"
          >
            <i class="fa fa-briefcase text-lg"></i>
          </div>
          Portfolio
        </button>

        <!-- FAVORITES -->
        <button
          @click="active = 'Favorites'"
          class="flex flex-col items-center text-xs"
          :class="active === 'Favorites' ? 'text-green-900' : 'text-gray-400'"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl mb-1"
            :class="active === 'Favorites' ? 'bg-green-100' : ''"
          >
            <i class="fa fa-heart text-lg"></i>
          </div>
          Favorites
        </button>

        <!-- RESEARCH -->
        <button
          @click="active = 'Research'"
          class="flex flex-col items-center text-xs"
          :class="active === 'Research' ? 'text-green-900' : 'text-gray-400'"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl mb-1"
            :class="active === 'Research' ? 'bg-green-100' : ''"
          >
            <i class="fa fa-search text-lg"></i>
          </div>
          Research
        </button>

        <!-- PROFILE -->
        <button
          @click="active = 'Profile'"
          class="flex flex-col items-center text-xs"
          :class="active === 'Profile' ? 'text-green-900' : 'text-gray-400'"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl mb-1"
            :class="active === 'Profile' ? 'bg-green-100' : ''"
          >
            <i class="fa fa-user text-lg"></i>
          </div>
          Profile
        </button>
      </div>
    </nav>
  </div>
</template>


<script setup>
const active = ref("Portfolio");
</script>
