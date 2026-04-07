<script setup></script>

<template>
  <div class="bg-gray-50">
    <Header />

    <!-- Banner Section -->
    <div>
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Career and Counseling Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex text-white-text capitalize w-11/12 mx-auto text-xs">
            <li><a href="/" class="mr-1">Home</a></li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/ccc" class="mr-1">Career and Counseling Center</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Sidebar -->
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <ul class="w-full">
          <li class="w-full">
        
            <ul>
              <li>
                <a
                  href="/ccc"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-green-800 text-white text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Career & Counseling Center
                </a>
              </li>

              <li>
                <a
                  href="/ccc/team"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-white text-green-800 text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  CCC Team
                </a>
              </li>

              <li>
                <a
                  href="/ccc/appointment/schedule"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-white text-green-800 text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Schedule an Appointment or Referral
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Main Content -->
<div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3 px-3">
  <div class="text-left mx-auto">
    <h2
      class="text-lg lg:text-xl font-bold text-center px-2 py-1 mb-1 uppercase bg-green-800 text-white"
    >
      Overview
    </h2>
    <p class="text-xs mt-4 mb-6 text-center text-green-800 font-bold">
      We design holistic, responsive, and differentiated student guidance
      programs that help you succeed in school-life.
    </p>

    <!-- Vision / Mission / Goal -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6"
    >
      <div class="w-full px-5 rounded-lg shadow mb-2">
        <h2
          class="text-lg lg:text-xl text-center font-bold text-green-800 px-2 py-1 mb-3"
        >
          Vision
        </h2>
        <p class="text-xs mb-6">
          The Career and Counseling Center (CCC) is an institutional support
          service of the university which aims toward holistic student
          development specifically designed to address students’ needs.
        </p>
      </div>

      <div class="w-full px-5 rounded-lg shadow mb-2">
        <h2
          class="text-lg lg:text-xl text-center font-bold text-green-800 px-2 py-1 mb-3"
        >
          Mission
        </h2>
        <p class="text-xs mb-6">
          To realize this vision, we commit ourselves to assist students in
          acquiring competencies in the areas of academic, career, personal and
          social development guided by the Lasallian core values of faith,
          service, and communion.
        </p>
      </div>

      <div class="w-full px-5 rounded-lg shadow mb-2">
        <h2
          class="text-lg lg:text-xl text-center font-bold text-green-800 px-2 py-1 mb-3"
        >
          Goal
        </h2>
        <p class="text-xs mb-6">
          To provide the students with varied activities to enable them to
          discover and understand themselves as a person; identify and accept
          their strengths and weaknesses; develop their talents, skills,
          potentials, and abilities, and learn how to relate effectively with
          other people.
        </p>
      </div>
    </div>

    <!-- Programs and Services -->
    <div class="shadow-lg my-3 rounded-lg px-3 sm:px-6 py-3">
      <h2
        class="text-lg lg:text-xl font-bold text-green-700 px-2 py-1 text-center uppercase"
      >
        Programs and Services
      </h2>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 text-sm text-gray-800"
      >
        <div>
          <h3 class="font-semibold text-sm mt-2 mb-2">General Services</h3>
          <ul class="list-disc list-inside text-xs mb-4 pl-3">
            <li>Information Services</li>
            <li>Initial/Intake Interview</li>
            <li>Exit Interview</li>
            <li>Personal/Academic/Career Counseling</li>
            <li>Crisis Intervention</li>
            <li>Psychological Assessment</li>
            <li>Consultation</li>
            <li>Evaluation</li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-sm mt-2 mb-2">Career Services</h3>
          <ul class="list-disc list-inside text-xs mb-4 pl-3">
            <li>Placement</li>
            <li>Pre-Employment Seminar-Workshop</li>
            <li>Career Coaching</li>
            <li>Career Education</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Getting To Know Yourself -->
    <div class="shadow-lg px-5 py-3 mb-3 border rounded-lg">
      <h2
        class="text-lg lg:text-xl font-bold text-center px-2 py-1 mb-1 uppercase text-green-800"
      >
        Getting To Know Yourself
      </h2>
      <p class="text-xs mb-6 text-center">
        To help us better understand your needs and challenges, and help you
        succeed in school through personal planning, you may be asked to
        participate in surveys, tests and other forms of assessments. This may
        involve being invited for interviews and/or Psychological Testing at
        CCC. Our team of qualified, duly-licensed counselors and psychometricians
        can help you develop skills or alleviate concerns:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="shadow rounded-lg px-3 py-2">
          <h3 class="font-semibold text-sm mt-2 mb-2 text-center">Academic</h3>
          <p class="text-xs mb-2 ">
            Poor study habits, difficulty understanding lessons, test anxiety,
            low performance, procrastination, or difficulty focusing and time
            management.
          </p>
        </div>

        <div class="shadow rounded-lg px-3 py-2">
          <h3 class="font-semibold text-sm mt-2 mb-2 text-center">
            Mental Health
          </h3>
          <p class="text-xs mb-2 ">
            Concerns about body image, emotions, stress, loss, anxiety,
            relationships, or crisis management.
          </p>
        </div>

        <div class="shadow rounded-lg px-3 py-2">
          <h3 class="font-semibold text-sm mt-2 mb-2 text-center">Career</h3>
          <p class="text-xs mb-2 ">
            Uncertainty about career path, lack of planning, poor
            communication/networking, or teamwork challenges.
          </p>
        </div>
      </div>
    </div>

    <!-- Counseling & Emergency -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
      <div class="shadow-lg w-full ">
        <h2
          class="text-lg lg:text-xl font-bold text-white bg-green-700 px-2 py-1 mb-3 text-center"
        >
          Seeking Counseling
        </h2>
        <p class="text-xs mb-6 px-3 pb-3 ">
          Counseling is a one-to-one helping relationship that focuses on
          personal growth, problem-solving, and decision-making. The guidance
          counselors at CCC are experienced practitioners providing a secure and
          confidential venue for students. Sessions last up to 40 minutes and
          may be up to 3 sessions. All full-time students and Lasallian partners
          are eligible to receive free counseling and related services.
        </p>
      </div>

      <div class="shadow-lg bg-white w-full ">
        <h2
          class="text-lg lg:text-xl text-center font-bold text-white bg-[#6a0505] px-2 py-1 mb-3"
        >
          Emergency Situations
        </h2>
        <div class="px-6 py-3">
          <p class="text-xs mb-4 ">
            If you or someone you know is experiencing suicidal thoughts, panic
            attacks, or any situation involving bodily harm, please contact:
          </p>
          <ul class="text-xs list-disc list-inside mb-4">
            <li>CCC Office: (088) 521-0342 / (088) 521-1561 Local: 132</li>
            <li>Philippine National Police – Ozamiz: (088) 521-2201</li>
            <li>Mobile: 0946-802-3894 / 0997-237-3135</li>
            <li>MHARS Medical Center: (088) 521-0440</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

    </div>

    <Footer />
  </div>
</template>

<style scoped></style>
