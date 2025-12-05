<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/social-actions/social-actions.jpg"
          class="align-top w-full h-36 object-cover lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Social Concerns Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/social-actions" class="mr-1"> Social Actions </a>
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
                Social Concerns Center
              </span>
              <ul>
                <li class="">
                  <a href="/social-actions" 
                    class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer"
                  
                 >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    About SCC
                  </a>
                </li>
                <li class="">
                  <a href="/social-actions/scc-programs-framework" 
                   class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 hover:text-white text-xs cursor-pointer bg-green-800 text-white"
                  
                  
                >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    SCC Programs Framework
                  </a>
                </li>
                <li class="">
                  <a href="/social-actions/activities" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-xs cursor-pointer text-green-800 hover:text-white">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Activities
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
  
          <!-- Office Program Overview -->
          <div class="p-6">
            <h2 class="text-lg font-bold text-green-800 mb-4">Office Program Overview</h2>
            <p class="text-sm leading-relaxed mb-4">
              The Social Concerns Center (SCC) anchored its programs/projects/activities to the seven (7) pillars of community extension services namely:
            </p>
            
            <div class="grid lg:grid-cols-2 gap-6 mb-6">
              <ol class="text-sm space-y-1">
                <li>1. Justice and Peace</li>
                <li>2. Environment</li>
                <li>3. Disaster Risk Reduction Management (DRRM)</li>
                <li>4. Youth-at-Risk</li>
              </ol>
              <ol class="text-sm space-y-1" start="5">
                <li>5. Poverty Alleviation</li>
                <li>6. Good Governance; and</li>
                <li>7. Community-Based Management Services (CBMS)</li>
              </ol>
            </div>

            <p class="text-sm leading-relaxed mb-4">
              However, the SCC rebrands its program name by adopting local dialects and aligning activities with the De La Salle Philippines (DLSP) direction. Thus, the office now has five (5) A's:
            </p>

            <div class="bg-green-50 p-4 rounded-lg mb-6">
              <ul class="text-sm space-y-2">
                <li><strong>a.1 AMIGO</strong>- Partnership and Networking Initiatives</li>
                <li><strong>a.2 ABAG</strong>- Disaster Response Management</li>
                <li><strong>a.3 ABANSIN</strong>- Advocacy and Volunteer Formation</li>
                <li><strong>a.4 ALAGAD</strong>- Community and/or Sector Based, and</li>
                <li><strong>a.5 ABAY</strong>- Education and Youth-at-Risk</li>
              </ul>
            </div>

            <!-- Program Details -->
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-green-800">Program and its Activities</h3>
              
              <!-- AMIGO -->
              <div class="border-l-4 border-green-500 pl-4">
                <h4 class="font-bold text-green-700 mb-2">a.1 AMIGO- Partnership and Networking Initiatives</h4>
                <p class="text-sm leading-relaxed mb-2">
                  The Partnership and Networking Program strengthens collaboration between universities, colleges, government agencies, NGOs, alumni associations, corporations, and DLSP member schools. By fostering strategic alliances, it enhances resource-sharing, advocacy efforts, and community-driven initiatives.
                </p>
                <p class="text-sm leading-relaxed">
                  Through these partnerships, the program expands opportunities for education, social development, and volunteer engagement, creating a unified network dedicated to sustainable and impactful change.
                </p>
              </div>

              <!-- ABAG -->
              <div class="border-l-4 border-blue-500 pl-4">
                <h4 class="font-bold text-blue-700 mb-2">a.2 ABAG- Disaster Response Management</h4>
                <p class="text-sm leading-relaxed">
                  The Disaster Response Management Program is designed to effectively address and alleviate the consequences of various calamities, both natural and anthropogenic, on specific communities. It answers the call of the Lasallian Justice and Peace Commission (LJPC) (for internal communities) and De La Salle Brothers Inc. Social Action Unit (SBI-SAO) in extending assistance to external communities in times of needs arises. This program engages all four (4) cycles of DRRM, orchestrating preparedness and mitigation, response, and recovery, thereby embodying a comprehensive and proactive approach to disaster resilience.
                </p>
              </div>

              <!-- ABANSIN -->
              <div class="border-l-4 border-purple-500 pl-4">
                <h4 class="font-bold text-purple-700 mb-2">a.3 ABANSIN- Advocacy and Volunteer Formation</h4>
                <p class="text-sm leading-relaxed">
                  The Advocacy and Volunteer Formation program empowers individuals to engage in social change through issue-based campaigns, awareness-building, and mobilization efforts. It fosters advocacy by organizing fora, symposiums, and discussions that equip participants with knowledge and skills to address pressing concerns.
                </p>
              </div>

              <!-- ALAGAD -->
              <div class="border-l-4 border-orange-500 pl-4">
                <h4 class="font-bold text-orange-700 mb-2">a.4 ALAGAD- Community and/or Sector Based</h4>
                <p class="text-sm leading-relaxed">
                  This program addresses the needs and priorities of our partner communities while fostering collaboration and empowerment among its members in the University and partner institutions.
                </p>
              </div>

              <!-- ABAY -->
              <div class="border-l-4 border-red-500 pl-4">
                <h4 class="font-bold text-red-700 mb-2">a.5 ABAY- Education and Youth-at-Risk</h4>
                <p class="text-sm leading-relaxed">
                  The Education and Youth-at-Risk Program is dedicated to addressing the needs of vulnerable children and youth through targeted educational initiatives. It supports student and institution-led programs that provide learning opportunities, mentorship, and skill development to empower at-risk youth.
                </p>
              </div>
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
