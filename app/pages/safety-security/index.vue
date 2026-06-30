<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative w-full">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-cover lg:hidden block"
        />
        <div class="absolute inset-0 flex items-center w-11/12 mx-auto">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-full"
          >
            Safety and Security
          </h1>
        </div>
      </div>
      <div class="pt-2.5 pb-3 shadow-lg bg-white relative z-10">
        <ul
          class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
        >
          <li>
            <a href="/" class="mr-1"> Home </a>
          </li>
          <li>
            <i class="fas fa-caret-right mr-1"></i>
            <a href="/safety-security" class="mr-1"> Safety and Security </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <div class="shadow lg:w-3/12 my-5 bg-white p-5">
        <h3 class="lasalle-green-text font-bold mb-3 uppercase text-sm border-b pb-2">Navigation</h3>
        <ul class="text-xs space-y-3 mt-3">
          <li>
            <a href="/safety-security" class="font-bold lasalle-green-text flex items-center">
              <i class="fas fa-angle-right mr-2"></i> Security Memo
            </a>
          </li>
        </ul>
      </div>
      <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3">
        <div class="bg-white shadow p-5 lg:p-8">
          <div class="text-center mb-8 border-b pb-5">
            <h2 class="font-bold text-xl uppercase mb-2">MEMORANDUM</h2>
            <p class="text-xs text-gray-500 mb-1">VPADS-SSEC-2627-001 | JUNE 27, 2026</p>
            <h3 class="font-bold mt-4 lasalle-green-text">IMPLEMENTATION OF MANDATORY SECURITY SCREENING AND VEHICLE TRAFFIC MANAGEMENT PROCEDURES</h3>
          </div>
          
          <div class="text-left mx-auto">
            <p class="lg:mt-7 mt-4 mb-4 text-xs lg:w-11/12 mx-auto w-11/12">
              In the interest of the safety and security of the Lasallian community, La Salle University shall implement mandatory bag inspection and visual vehicle security screening upon entry to the campus.
            </p>
            <p class="mb-8 text-xs lg:w-11/12 mx-auto w-11/12">
              To ensure the orderly conduct of these procedures, the following access points and traffic arrangements shall be observed in Campus 2:
            </p>
          </div>
          
          <div class="block mx-auto lg:w-11/12">
            <div class="lg:flex lg:gap-10 lg:w-full w-11/12 mx-auto mb-8">
              <div class="w-full mb-6 lg:mb-0">
                <div class="font-bold lg:text-lg text-base mb-3 text-center lasalle-green">
                  <span class="text-white px-2 py-1 tracking-widest">1. Vehicle Entry and Drop-Off</span>
                </div>
                <div class="w-full mx-auto">
                  <p class="text-left text-xs mb-2">
                    All vehicles entering through the boom barrier at Gate 8 shall proceed along the left side of the BVM roadway. Passenger drop-off shall be allowed only on the left side of the roadway, from the boom barrier up to the area near the Registrar's Office.
                  </p>
                </div>
              </div>

              <div class="w-full">
                <div class="font-bold lg:text-lg text-base mb-3 text-center lasalle-green">
                  <span class="text-white px-2 py-1 tracking-widest">2. Short-Term Parking</span>
                </div>
                <div class="w-full mx-auto">
                  <p class="text-left text-xs mb-2">
                    Vehicles for short-term or express parking shall proceed beyond the Registrar's Rotunda and park only on the right side of the roadway, specifically in the designated orange parking zone.
                  </p>
                </div>
              </div>
            </div>

            <div class="lg:flex lg:gap-10 lg:w-full w-11/12 mx-auto mb-8">
              <div class="w-full mb-6 lg:mb-0">
                <div class="font-bold lg:text-lg text-base mb-3 text-center lasalle-green">
                  <span class="text-white px-2 py-1 tracking-widest">3. Security Screening Points</span>
                </div>
                <div class="w-full mx-auto">
                  <p class="text-left text-xs mb-3">
                    All students, faculty, staff, parents, visitors, and other campus guests shall undergo bag inspection and security screening at the following access points:
                  </p>
                  <ul class="list-disc pl-5 text-xs text-left space-y-1">
                    <li>Gate 8</li>
                    <li>In front of the BVM Registrar's Office</li>
                    <li>BVM Left Wing</li>
                    <li>Gate 7</li>
                    <li>St. Joseph Building Main Entrance</li>
                  </ul>
                </div>
              </div>

              <div class="w-full">
                <div class="font-bold lg:text-lg text-base mb-3 text-center lasalle-green">
                  <span class="text-white px-2 py-1 tracking-widest">4. SJ Building Access</span>
                </div>
                <div class="w-full mx-auto">
                  <p class="text-left text-xs mb-2">
                    Entry to and exit from the St. Joseph Building shall be allowed only through the main entrance. All side entrances and exits shall remain closed and shall be used only during emergencies.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="lg:flex lg:gap-10 lg:w-full w-11/12 mx-auto mb-8">
              <div class="w-full">
                <div class="font-bold lg:text-lg text-base mb-3 text-center lasalle-green">
                  <span class="text-white px-2 py-1 tracking-widest">5. Parents and Guardians</span>
                </div>
                <div class="w-full mx-auto">
                  <p class="text-left text-xs mb-2">
                    Parents and guardians are requested to stay at the designated Parents' Lounge or the Central Food Park while waiting. Access to building premises shall be allowed only during student drop-off and pick-up.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="lg:w-full w-11/12 mx-auto mt-10">
              <div class="font-bold lg:text-lg text-base mb-3 text-center bg-red-600">
                <span class="text-white px-2 py-1 tracking-widest uppercase">Important Reminder</span>
              </div>
              <div class="w-full mx-auto p-5 border border-red-200 bg-red-50">
                <p class="text-left text-xs mb-4 font-bold text-red-700">
                  The University strictly prohibits the entry, possession, or use of the following within campus premises:
                </p>
                <ul class="list-disc pl-5 text-xs text-left text-red-800 space-y-2">
                  <li>Alcoholic beverages</li>
                  <li>Weapons, firearms, knives, and other equivalent sharp objects</li>
                  <li>Non-permitted flammable substances</li>
                  <li>E-cigarettes (vapes) and cigarettes</li>
                  <li>Explosives, firecrackers, pyrotechnics, or similar hazardous devices</li>
                  <li>Gambling materials or paraphernalia</li>
                  <li>Illegal drugs and prohibited substances</li>
                  <li>Any other item deemed dangerous, harmful, or inappropriate within the university premises</li>
                </ul>
              </div>
            </div>

            <div class="mt-12 text-center w-11/12 mx-auto text-xs">
              <p class="mb-3 italic">The cooperation and understanding of all members of the Lasallian community are earnestly requested to ensure the proper implementation of these measures and to maintain a safe and secure campus environment for everyone.</p>
              <p class="font-bold lasalle-green-text">For your information, guidance, and strict compliance.</p>
            </div>
            
          </div>
        </div>
      </div>
    </div>

        <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/ParkingAreas.jpg" alt="">
    <Footer />
  </div>
</template>