<script setup>
const menuList = [
  { label: "BEU Programs", link: "/academics/basic-education" },
  { label: "BEU Graduate Attributes", link: "/academics/basic-education/graduate-attributes" },
  { label: "Admissions", link: "/academics/basic-education/admissions" },
  { label: "Scholarships and Grants", link: "/academics/basic-education/scholarships-grants" },
  { label: "Fees and Payments", link: "/academics/basic-education/fees-payments" }
];
</script>

<template>
  <div class="bg-gray-50">
    <Header />

    <!-- Banner -->
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Basic Education Unit
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li><a href="/" class="mr-1"> Home </a></li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/academics/basic-education" class="mr-1"> Basic Education </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">

      <!-- Side Menu -->
      <div class="shadow lg:w-3/12 my-5 bg-white rounded-lg overflow-hidden">
        <DynamicSideMenu :items="menuList" title="Sub Pages" />
      </div>

      <!-- MAIN CONTENT -->
      <div class="lg:w-9/12 mx-auto lg:my-5 my-3 prose max-w-full text-justify">

        <div class="bg-white p-6 shadow rounded-lg">

          <!-- I. BASIC EDUCATION VISION MISSION -->
          <h2 class="lasalle-green-text font-bold text-xl mb-2">
            I. Grade School, Junior High School and Senior High School
          </h2>

          <!-- VISION -->
          <h3 class="font-semibold lasalle-green-text mt-4">VISION</h3>
          <p>
            La Salle University Integrated School is a Catholic, PAASCU accredited basic education unit,
            dedicated to the holistic development of students through the pursuit of academic excellence,
            the enrichment of values and sharpening of skills, as well as the promotion of social
            responsibility. Articulate, competent, highly qualified, morally upright and versatile teachers
            are groomed to teach and train students to accomplish, as well as go beyond, basic academic
            requirements. Highly motivated and globally competitive educators of the institution mold
            students to produce generations of youth who are zealously dedicated to the pursuit of
            lifelong excellence and exemplary service.
          </p>

          <!-- MISSION -->
          <h3 class="font-semibold lasalle-green-text mt-4">MISSION</h3>
          <p>We commit ourselves to:</p>
          <ul class="list-disc ml-10">
            <li>
              Boost students’ academic performance and non-academic competence through the delivery of
              relevant instruction and enhanced student development programs.
            </li>
            <li>
              Produce innovative and globally-adept graduates who are responsive to the needs of the
              times, through intensive values integration.
            </li>
            <li>
              Participate in the building of a just and humane society, through active involvement in
              various community extension programs.
            </li>
          </ul>

          <!-- II. SCHOOL FOR THE DEAF -->
          <h2 class="lasalle-green-text font-bold text-xl mt-10">
            II. School for the Deaf
          </h2>

          <!-- VISION -->
          <h3 class="font-semibold lasalle-green-text mt-4">VISION</h3>
          <p>
            La Salle University School for the Deaf envisions to be the catalyst for the social
            recognition and acceptance of all deaf people as full and equal citizens, empowered to
            actualize their potentials by an active participation in the economic, social and cultural
            life of the community. It provides a quality Lasallian education to the less privileged deaf
            and hard-of-hearing students.
          </p>

          <!-- MISSION -->
          <h3 class="font-semibold lasalle-green-text mt-4">MISSION</h3>
          <p>
            The School for the Deaf is committed to provide quality special Lasallian education, empower
            the deaf and their families and create opportunities for them to engage in activities in the
            communities where they live.
          </p>

          <!-- OBJECTIVES -->
          <h3 class="font-semibold lasalle-green-text mt-4">OBJECTIVES</h3>
          <ul class="list-disc ml-10">
            <li>
              Improve the quality of life of the deaf by providing appropriate Lasallian quality education
              from Grade School, Junior High School and Senior High School levels.
            </li>
            <li>
              Provide vocational and life skills training, sporting activities, artistic and creative
              activities.
            </li>
            <li>
              Empower the deaf and their families so that they can advocate for their rights in society.
            </li>
            <li>
              Provide special services where the deaf are welcomed, loved, and cared for.
            </li>
          </ul>

        </div>
      </div>

    </div>

    <Footer />
  </div>
</template>

<style scoped>
.lasalle-green-text {
  color: #0b6b40;
}
</style>
