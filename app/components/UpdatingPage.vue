<template>
  <div
    class="min-h-screen flex items-center justify-center bg-white text-green-900 py-12 px-4"
  >
    <div class="text-center px-6">
      <img
        src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
        class="lg:w-3/12 mx-auto"
      />

      <!-- Main Message -->
      <h2 class="text-2xl md:text-3xl font-semibold mt-10 mb-10">
        Updating Document Request Form
      </h2>

      <p class="mb-8 max-w-xl mx-auto">
        We’re currently improving our system to serve you better. The Document
        Request Form is temporarily unavailable. Please check back shortly.
      </p>

      <!-- Optional Button -->
      <NuxtLink
        to="/"
        class="inline-block bg-white text-green-900 font-semibold px-6 py-2 rounded-lg shadow hover:bg-green-100 transition"
      >
        Go Back Home
      </NuxtLink>

      <!-- Footer -->
      <p class="mt-10 text-sm text-green-800">
        © {{ new Date().getFullYear() }} La Salle University
      </p>
    </div>
  </div>
</template>
