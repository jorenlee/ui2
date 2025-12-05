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
        <div>

        </div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            About
            <!-- <span class="lg:text-base text-xs lg:mt-5 ml-5">A.Y. 2024-2025</span> -->
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about" class="mr-1"> About </a>
            </li>
            <!-- <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about-lsu" class="mr-1">  </a>
            </li> -->
          </ul>
        </div>
      </div>
    </div>

    <!-- <div>
      <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/LSUOrganizationalChart.png" 
      class="lg:w-8/12 w-11/12 mx-auto my-5"/>
    </div> -->

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
  <div class="shadow lg:w-3/12 my-5 bg-white">
      <AboutSideMenu />
    </div>
    <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3">
      <div>
        <div class="text-center mx-auto mb-8">
          <h2 class="font-bold lg:text-2xl text-xl text-green-800 mb-4">
            Vocations
          </h2>
          <p class="text-xs lg:w-8/12 mx-auto w-11/12">
            Called to Serve in the Lasallian Mission
          </p>
        </div>

        <div class="block mx-auto lg:w-11/12 w-11/12">
          <!-- Introduction -->
          <div class="mb-8">
            <p class="text-xs mb-4 text-justify">
              The Brothers of the Christian Schools is a Roman Catholic religious teaching congregation,
              founded in France by Saint John Baptist de La Salle— a priest who saw the need for a group
              of lay men who would dedicate their lives to the ministry of Christian education, especially
              for the poor. They are more commonly known as the "De La Salle Brothers".
            </p>
            <p class="text-xs mb-4 text-justify">
              The Lasallian vocation is a call to serve God through the education of the young,
              especially the poor. Following in the footsteps of St. John Baptist de La Salle,
              the Brothers of the Christian Schools and Lasallian Partners dedicate their lives
              to touching hearts and transforming lives through quality human and Christian education.
            </p>
          </div>

          <!-- Brothers of the Christian Schools -->
          <div class="mb-8 bg-white p-6 shadow-md rounded">
            <h3 class="font-bold text-lg text-green-800 mb-4">
              Brothers of the Christian Schools (FSC)
            </h3>
            <p class="text-xs mb-3 text-justify">
              The De La Salle Brothers are Catholic religious men who are not priests. They dedicate
              their lives to God through vows of association for the educational service of the poor,
              stability in the Institute, and obedience. Their mission is to provide a human and
              Christian education to the young, especially the poor.
            </p>
            <p class="text-xs mb-3 text-justify">
              Brothers live in community and work together in schools, universities, and other
              educational ministries around the world. They are educators, administrators, counselors,
              and mentors who accompany young people in their journey of faith and learning.
            </p>
            <div class="mt-4">
              <h4 class="font-semibold text-sm text-green-700 mb-2">Characteristics of a Brother:</h4>
              <ul class="list-disc list-inside text-xs space-y-1 ml-4">
                <li>Committed to lifelong learning and personal growth</li>
                <li>Passionate about education and the welfare of young people</li>
                <li>Living in community with other Brothers</li>
                <li>Dedicated to prayer and spiritual development</li>
                <li>Serving the poor and marginalized</li>
              </ul>
            </div>
          </div>

          <!-- Lasallian Presence in the Philippines -->
          <div class="mb-8 bg-green-50 p-6 rounded">
            <h3 class="font-bold text-xl text-green-800 mb-4 uppercase text-center">
              Lasallian Presence in the Philippines
            </h3>

            <!-- Archbishop Harty Image and Description -->
            <div class="mb-6">
              <div class="lg:float-right lg:ml-6 lg:w-5/12 w-full mb-4">
                <img
                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/about/ArchJere.jpg"
                  alt="Archbishop Jeremiah James Harty"
                  class="w-full h-auto shadow-lg rounded"
                />
                <p class="text-xs italic text-gray-700 mt-2 text-center">
                  Archbishop Jeremiah James Harty, the first American Archbishop of Manila.
                  He was once a student of the Christian Brothers in St. Louis, Missouri.
                </p>
              </div>
              <p class="text-xs mb-4 text-justify">
                The arrival of the Brothers in the Philippines was put into motion by one man,
                Archbishop Jeremiah James Harty, the first American Archbishop of Manila. He was
                once a student of the Christian Brothers in St. Louis, Missouri. He arrived in
                Manila during a time where strong anti-friar sentiments, mainly due to the aftermath
                of the Philippine Revolution, were causing the established Catholic institutions to
                lose ground to their secular counterparts. Archbishop Harty maintained a passionate
                belief in Christian education. It was his ardent desire to establish a school that
                would provide young boys with a solid Catholic Education and, at the same time,
                teach them the English Language.
              </p>
              <p class="text-xs mb-4 text-justify">
                The American Archbishop had a great admiration for the type of education that the
                Brothers of the Christian Schools offered. In 1904, he requested Br. Clementian,
                then Superior General of the Brothers of the Christian Schools, to open a school
                in the Philippines, but his initial request was rejected. However, Archbishop Harty
                persisted with his requests and eventually received a Papal mandate in 1907 for the
                Brothers to formally open a school in Manila.
              </p>
            </div>

            <!-- First Brothers Community Image and Description -->
            <div class="clear-both mb-6">
              <div class="lg:float-left lg:mr-6 lg:w-5/12 w-full mb-4">
                <img
                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/about/FirstBrothersCommunity.jpg"
                  alt="The First Brothers Community"
                  class="w-full h-auto shadow-lg rounded"
                />
                <p class="text-xs italic text-gray-700 mt-2 text-center">
                  The First Brothers Community.
                </p>
              </div>
              <p class="text-xs mb-4 text-justify">
                On the 10th of March 1911, the three Founding Brothers arrived in Manila via Europe.
                Brs. Blimond Pierre (Eilenbecker), Aloysius Gonzaga (McGiverin) and Augusto Correge
                became guests of Archbishop Harty. In two months time, on 13 May, the six remaining
                Brothers of the Founding Community arrived in Manila. They were Br. Ptolomee Louis
                (Duffaux), Br. Goslin Camillus (Henri), Br. D. Joseph, Br. Celba John (Lynam),
                Br. Imar William (Reale), and Br. Martin.
              </p>
              <p class="text-xs mb-4 text-justify">
                De La Salle College officially opened its doors to 125 youngsters on 16 June 1911
                in a 13,000-square meter property on Nozaleda Street in Paco, Manila. By 10 July,
                the total number to students reached 175. Forty were boarding students, while those
                who took a mid-day meal on campus were termed half-boarders. Br. Blimond, a native
                of France, became the first head of the college.
              </p>
            </div>

            <div class="clear-both">
              <p class="text-xs mb-4 text-justify font-semibold text-green-800">
                Today, there are now 50 professed Filipino Brothers. These men continue the legacy
                set forth by the Founding Brothers and the mission of the Founder 300 years ago.
              </p>
            </div>
          </div>

          <!-- Lasallian Partners -->
          <div class="mb-8 bg-white p-6 shadow-md rounded">
            <h3 class="font-bold text-lg text-green-800 mb-4">
              Lasallian Partners and Lay Educators
            </h3>
            <p class="text-xs mb-3 text-justify">
              Lasallian Partners are lay men and women, married or single, who share in the
              Lasallian mission. They work alongside the Brothers in schools and educational
              institutions, bringing the Lasallian charism to life in their teaching,
              administration, and service.
            </p>
            <p class="text-xs mb-3 text-justify">
              As partners in mission, they embrace the Lasallian core values and commit themselves
              to the educational service of the young. They participate in formation programs,
              prayer, and community activities that deepen their understanding and living of the
              Lasallian spirit.
            </p>
          </div>

          <!-- Discernment -->
          <div class="mb-8 bg-green-50 p-6 rounded">
            <h3 class="font-bold text-lg text-green-800 mb-4">
              Discerning Your Vocation
            </h3>
            <p class="text-xs mb-4 text-justify">
              If you feel called to serve in the Lasallian mission, whether as a Brother or as a
              Lasallian Partner, we encourage you to:
            </p>
            <ul class="list-disc list-inside text-xs space-y-2 ml-4 mb-4">
              <li>Pray and reflect on God's call in your life</li>
              <li>Learn more about the Lasallian charism and mission</li>
              <li>Speak with Brothers and Lasallian educators about their experiences</li>
              <li>Participate in Lasallian formation programs and retreats</li>
              <li>Visit Lasallian communities and ministries</li>
              <li>Seek spiritual direction and guidance</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div class="bg-white p-6 shadow-md rounded">
            <h3 class="font-bold text-lg text-green-800 mb-4">
              Learn More
            </h3>
            <p class="text-xs mb-4 text-justify">
              For more information about vocations to the Brothers of the Christian Schools or
              becoming a Lasallian Partner, please contact:
            </p>
            <div class="text-xs space-y-2">
              <p><strong>Lasallian Vocation Ministry</strong></p>
              <p>La Salle University - Ozamiz</p>
              <p>Email: <a href="mailto:vocation@lsu.edu.ph" class="text-green-700 hover:underline">vocation@lsu.edu.ph</a></p>
              <p>Phone: (088) 531-1396</p>
            </div>
            <div class="mt-6">
              <p class="text-xs italic text-gray-600">
                "The work of the Brothers is to proclaim the Gospel and to make Jesus Christ known
                and loved, especially among the poor." - St. John Baptist de La Salle
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
/* a {
    border: 1px solid #969696;
    border-bottom: none;
  }
  a:hover {
    border: 1px solid #969696;
    border-bottom: none;
    background: #00cc00;
    color: #000;
  }
  a.active {
    background: #005e00;
    color: white !important;
    border-color: none !important;
  } */
</style>
