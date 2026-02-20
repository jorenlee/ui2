<template>
  <div>
    <!-- UNAUTHORIZED VIEW -->
    <div class="flex items-center justify-center h-screen bg-gray-50">
      <div class="text-center">
        <i class="fa fa-lock text-4xl text-gray-400 mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">
          Unauthorized Access
        </h1>
        <p class="text-gray-600 mb-6">Please log in to access the dashboard.</p>
        <NuxtLink
          to="/cms/login"
          class="inline-block bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg font-bold transition-colors"
        >
          <i class="fa fa-sign-in mr-2"></i>Go to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
