<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Institutional Research and Publication Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/research" class="mr-1"> Research </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Sidebar -->
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <div>
          <ul class="w-full">
            <li class="w-full">
              <span class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base">
               La Salle University
              </span>
              <ul>
                <li class="">
                  <a href="/research" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 hover:text-white text-xs cursor-pointer bg-green-800 text-white">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    About IRPC
                  </a>
                </li>
                <li class="">
                  <a href="/research/publications" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Publications
                  </a>
                </li>
                <li class="">
                  <a href="/library/subrscribedElectronicResources" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-xs cursor-pointer text-green-800 hover:text-white">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    E-Journals
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main Content -->
      <div class="justify-center lg:w-9/12 mx-auto lg:my-5 my-3">
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <!-- Header -->
          <!-- <div class="bg-green-800 text-white px-6 py-4">
            <h1 class="text-2xl font-bold">Institutional Research and Publication Center</h1>
          </div> -->

          <!-- Content Grid -->
          <div class="grid lg:grid-cols-2 gap-0 border">
            <!-- Vision -->
            <div class="border-r border-b p-6">
              <h2 class="text-lg font-bold text-green-800 mb-4">Vision</h2>
              <p class="text-sm leading-relaxed">
                The Institutional Research and Publication Office (IRPO), in partnership with the academic and external communities, is the frontrunner of innovation and research in Misamis Occidental and Zamboanga Peninsula for the transformation and development of humanity and society.
              </p>
            </div>

            <!-- Thrusts and Priorities -->
            <div class="border-b p-6">
              <h2 class="text-lg font-bold text-green-800 mb-4">Thrusts and Priorities</h2>
              <p class="text-sm mb-3">To realize the vision of IRPO, it commits itself to work on the following thrusts that shape priorities in the promotion of research projects that will:</p>
              <ul class="text-sm space-y-2">
                <li class="flex items-start">
                  <span class="font-bold mr-2">a.</span>
                  <span>Improve the quality of education geared towards the development of lifelong learners</span>
                </li>
                <li class="flex items-start">
                  <span class="font-bold mr-2">b.</span>
                  <span>Contribute to the existing body of knowledge and innovation relevant for nation building</span>
                </li>
                <li class="flex items-start">
                  <span class="font-bold mr-2">c.</span>
                  <span>Address pressing social and environmental problems to better the life in the local, national, and global community</span>
                </li>
                <li class="flex items-start">
                  <span class="font-bold mr-2">d.</span>
                  <span>Strengthen collaboration/partnership with institutions, agencies, and community partners in mending societal gaps and inequalities</span>
                </li>
              </ul>
            </div>

            <!-- Research Agenda (Full Width) -->
            <div class="lg:col-span-2 border-b p-6">
              <h2 class="text-lg font-bold text-green-800 mb-4">Institutional Research Agenda</h2>
              <p class="text-sm mb-4">
                The university adheres to the research agenda proposed by the International Association of Lasallian Universities and the National Higher Education Research Agenda (NHERA) and anchors on the Sustainable Development Goals (SDG) of the United Nations.
              </p>
              <p class="text-sm mb-4">
                To ensure the relevance of the university's research, the university and its community of scholars aim to conduct research that builds and cherishes the ANIMO in us.
              </p>
              <p class="text-sm font-bold mb-4">By ANIMO we mean:</p>
              
              <div class="grid lg:grid-cols-5 gap-4 mb-6">
                <div class="text-center">
                  <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span class="text-2xl font-bold text-green-800">A</span>
                  </div>
                  <p class="text-xs font-semibold">Alleviate</p>
                </div>
                <div class="text-center">
                  <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span class="text-2xl font-bold text-green-800">N</span>
                  </div>
                  <p class="text-xs font-semibold">Nurture</p>
                </div>
                <div class="text-center">
                  <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span class="text-2xl font-bold text-green-800">I</span>
                  </div>
                  <p class="text-xs font-semibold">Innovate</p>
                </div>
                <div class="text-center">
                  <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span class="text-2xl font-bold text-green-800">M</span>
                  </div>
                  <p class="text-xs font-semibold">Mediate</p>
                </div>
                <div class="text-center">
                  <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span class="text-2xl font-bold text-green-800">O</span>
                  </div>
                  <p class="text-xs font-semibold">Optimize</p>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <h3 class="font-bold text-green-800 mb-2">A - Alleviate</h3>
                  <p class="text-sm">Alleviate poverty and promote good health and well-being. This research agenda shall focus on research development and collaboration across disciplines to generate inputs for formulating policies, plans, programs, and products to make the community's lives better, decent, and healthy.</p>
                </div>
                <div>
                  <h3 class="font-bold text-green-800 mb-2">N - Nurture</h3>
                  <p class="text-sm">Nurture social cohesion and ecological integrity. This research agenda aims to produce research outputs that address pressing social and environmental problems and aid policy formulation, community development, and public awareness to create gender-responsive, disaster-ready, and environment-friendly communities.</p>
                </div>
                <div>
                  <h3 class="font-bold text-green-800 mb-2">I - Innovate</h3>
                  <p class="text-sm">Innovate models, systems, approaches, and technologies. This prioritizes multidisciplinary research works that generate new knowledge and advance the frontiers in various disciplines. Research outputs aim to produce education technologies and develop innovative programs, models, systems, and approaches that help build sustainable cities and communities.</p>
                </div>
                <div>
                  <h3 class="font-bold text-green-800 mb-2">M - Mediate</h3>
                  <p class="text-sm">Mediate societal interests and government initiatives. This agenda emphasizes collaborative research outputs that aid good governance, policy formulation and implementation, and direction setting and give equal attention to all life forms.</p>
                </div>
                <div>
                  <h3 class="font-bold text-green-800 mb-2">O - Optimize</h3>
                  <p class="text-sm">Optimize local resources, indigenous knowledge, culture and the arts. This agenda highlights research that recognizes and upholds the development of local resources and indigenous knowledge to ensure energy security and produce a self-sufficient community. In this theme, research priorities also include life appreciation through the promotion of culture and the arts.</p>
                </div>
              </div>
            </div>

            <!-- Strategies -->
            <div class="border-r p-6">
              <h2 class="text-lg font-bold text-green-800 mb-4">Strategies</h2>
              <ul class="text-sm space-y-2">
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Encourage partnerships among faculty members, between faculty and students, and between the university and the local government units</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Promote multidisciplinary and interdisciplinary research</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Develop research proposals for DOST, NRCP, NCCA, and other research funding institutions of the university journal, Lasallian Research Forum</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Strong linkages, partnerships, and collaboration with academic, non-academic, government, and funding institutions</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Nurture the culture of research in all departments and colleges</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Build the expertise of the faculty members</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Mainstream the research agenda in the senior high school, undergraduate, and graduate studies</span>
                </li>
              </ul>
            </div>

            <!-- Measures -->
            <div class="p-6">
              <h2 class="text-lg font-bold text-green-800 mb-4">Measures</h2>
              <ul class="text-sm space-y-2">
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Increased number of paper presentations in non-predatory conferences and publications in refereed and high-impact indexed journals (Scopus, ISI, Asean Citations, etc.)</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Increased number of multidisciplinary and interdisciplinary research</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">●</span>
                  <span>Regular publication</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<style scoped>
</style>
