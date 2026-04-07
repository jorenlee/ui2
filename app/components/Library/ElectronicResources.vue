<script setup>
// ✅ Electronic Resources Data
const info = ref([
  {
    name: "ProQuest Central",
    banner_image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/proquest.png",
    description: "Search scholarly journals, books, videos, dissertations & theses, newspapers and more.",
    url: "https://search.proquest.com/",
    username: "DLSOZA",
    password: "Monday1!(case sensitive)",
    color: "blue",
  },
  {
    name: "Gale Cengage",
    banner_image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/gale cengage.png",
    description: "Access hundreds of databases including Academic OneFile, Biography Index, and more.",
    url: "http://infotrac.gale.com/itweb/phlsu",
    username: "LSUOZAMIZ",
    password: "almighty",
    color: "green",
  },
  {
    name: "Philippine E-Journals",
    banner_image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/pej.png",
    description: "Search scholarly journals, books, videos, dissertations, newspapers and more.",
    url: "https://ejournals.ph/",
    username: "lsuopej",
    password: "lsuopej",
    color: "purple",
  },
  {
    name: "Magzter",
    banner_image: "https://cdn.magzter.com/images/logo/magzter_logo_header.svg",
    description: "Digital magazine newsstand with thousands of magazines.",
    url: "https://www.magzter.com/",
    username: "N/A",
    password: "N/A",
    color: "red",
  },
  {
    name: "Science Direct",
    banner_image:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/elsevier-non-solus-new-grey.png",
    description: "Leading platform for peer-reviewed scientific, technical and medical research.",
    url: "https://www.sciencedirect.com/",
    username: "N/A",
    password: "N/A",
    color: "orange",
  },
]);

// ✅ Copy to clipboard functionality
const copyToClipboard = (text, type) => {
  navigator.clipboard.writeText(text).then(() => {
    alert(`${type} copied to clipboard!`);
  });
};
</script>

<template>
  <div class="py-10">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-3 mb-3">
          <i class="fa fa-database text-3xl text-green-700"></i>
          <h2 class="font-bold text-4xl text-green-800">
            Subscribed Electronic Resources
          </h2>
        </div>
        <p class="text-gray-600 text-sm max-w-2xl mx-auto">
          Access our collection of premium academic databases and digital resources
        </p>
      </div>

      <!-- Resources Grid -->
      <div class="w-11/12 lg:w-10/12 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div
          v-for="(resource, index) in info"
          :key="index"
          class="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-green-500 overflow-hidden"
        >
          <!-- Card Header with Color Accent -->
          <div
            class="h-2"
            :class="{
              'bg-blue-500': resource.color === 'blue',
              'bg-green-500': resource.color === 'green',
              'bg-purple-500': resource.color === 'purple',
              'bg-red-500': resource.color === 'red',
              'bg-orange-500': resource.color === 'orange',
            }"
          ></div>

          <!-- Image Section -->
          <div class="p-6 bg-white flex items-center justify-center min-h-[180px]">
            <a
              :href="resource.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block w-full transition-transform duration-300 group-hover:scale-105"
            >
              <img
                :src="resource.banner_image"
                :alt="resource.name"
                class="w-full h-auto max-h-32 object-contain"
              />
            </a>
          </div>

          <!-- Content Section -->
          <div class="px-6 pb-6">
            <!-- Resource Name -->
            <h3 class="font-bold text-xl text-gray-800 mb-3 text-center">
              {{ resource.name }}
            </h3>

            <!-- Description -->
            <p class="text-gray-600 text-sm text-center mb-4 min-h-[60px] leading-relaxed">
              {{ resource.description }}
            </p>

            <!-- Credentials Section -->
            <div v-if="resource.username !== 'N/A'" class="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <!-- Username -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-1">
                  <i class="fa fa-user text-green-600 text-sm"></i>
                  <span class="text-xs text-gray-600 font-medium">Username:</span>
                  <span class="text-xs font-bold text-gray-800 break-all">{{ resource.username }}</span>
                </div>
                <button
                  @click="copyToClipboard(resource.username, 'Username')"
                  class="flex-shrink-0 p-2 hover:bg-green-100 rounded-md transition-colors duration-200 group/btn"
                  title="Copy username"
                >
                  <i class="fa fa-copy text-green-600 text-sm group-hover/btn:scale-110 transition-transform"></i>
                </button>
              </div>

              <!-- Password -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-1">
                  <i class="fa fa-lock text-green-600 text-sm"></i>
                  <span class="text-xs text-gray-600 font-medium">Password:</span>
                  <span class="text-xs font-bold text-gray-800 break-all">{{ resource.password }}</span>
                </div>
                <button
                  @click="copyToClipboard(resource.password, 'Password')"
                  class="flex-shrink-0 p-2 hover:bg-green-100 rounded-md transition-colors duration-200 group/btn"
                  title="Copy password"
                >
                  <i class="fa fa-copy text-green-600 text-sm group-hover/btn:scale-110 transition-transform"></i>
                </button>
              </div>
            </div>

            <!-- No Credentials Message -->
            <div v-else class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p class="text-xs text-blue-700 text-center flex items-center justify-center gap-2">
                <i class="fa fa-info-circle"></i>
                <span>No login required - Open access</span>
              </p>
            </div>

            <!-- Access Button -->
            <a
              :href="resource.url"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold text-sm py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <i class="fa fa-external-link-alt"></i>
              <span>Access Resource</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
