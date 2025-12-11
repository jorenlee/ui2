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

    <!-- Content Layout -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">

      <!-- Side Menu -->
      <div class="shadow lg:w-3/12 my-5 bg-white rounded-lg overflow-hidden">
        <DynamicSideMenu :items="menuList" title="Sub Pages" />
      </div>

      <!-- Main Content -->
      <div class="lg:w-9/12 mx-auto lg:my-5 my-3 prose max-w-full text-justify">

        <div class="bg-white p-6 shadow rounded-lg">

          <!-- ADMISSION TITLE -->
          <h2 class="lasalle-green-text font-bold text-xl">BEU Admission</h2>

          <!-- WALK-IN ENROLLMENT -->
          <h3 class="font-semibold mt-4 lasalle-green-text">Walk-in Enrollment</h3>
          <ol class="list-decimal ml-6">
            <li>Pay the Placement/Entrance Exam fee at the Accounting Office.</li>
            <li>Present the receipt, submit the photocopy of your report card with a recent 2x2 picture attached and take the placement exam at the Basic Education Testing Center.</li>
            <li>Get your official Placement/Entrance Exam result from the Testing Officer.</li>
            <li>Proceed to the Academic Assistant/Strand Coordinator for academic advising.</li>
            <li>
              Fill in the Enrollment Application Form and submit the following requirements to the Registrar’s Office:
              <ul class="list-disc ml-6 mt-2">
                <li>Birth certificate (PSA Security Paper)</li>
                <li>1 piece recent 2x2 picture</li>
                <li>Original report card (Form 138)</li>
                <li>Original Certificate of Good Moral Character</li>
                <li>Other supporting documents that may be required*</li>
              </ul>
            </li>
            <li>Pay the enrollment deposit at the Accounting Office.</li>
            <li>Present the receipt to the Registrar’s Office to secure Certificate of Enrollment (for incoming Senior High School only).</li>
            <li>Go to the designated room for ID picture taking.</li>
          </ol>

          <!-- ONLINE ENROLLMENT -->
          <h3 class="font-semibold mt-6 lasalle-green-text">Online Enrollment</h3>
          <ol class="list-decimal ml-6">
            <li>Visit the LSU website (<span class="text-blue-700">http://my.lsu.edu.ph/</span>) and click the Parents’/Students’ option.</li>
            <li>New students should create a new account while old students log in using their username and password.</li>
            <li>
              Fill out the General Student Personal Information Sheet (GSPIS).  
              The system will generate a temporary ID after providing your temporary password.  
              This will be used during enrollment.
            </li>
            <li>Take the entrance exam and wait for confirmation and interview schedule from the Guidance Officer.</li>
            <li>
              Pay your enrollment deposit through:
              <ul class="list-disc ml-6 mt-2">
                <li>Kwarta Padala (MLhuillier, PALAWAN Pawnshop) or GCash</li>
                <li>BPI, BDO, Security Bank, Metrobank (LSU accounts)</li>
              </ul>
            </li>
            <li>Send a copy of your transaction or deposit slip to <b>finance@lsu.edu.ph</b>.</li>
          </ol>

          <!-- ADDITIONAL REQUIREMENTS -->
          <h3 class="font-semibold mt-6 lasalle-green-text">Additional Requirements for Incoming Grade 11 Students</h3>
          <ul class="list-disc ml-6">
            <li>ESC Certificate</li>
            <li>Voucher Certificate for those from private non-ESC schools</li>
          </ul>

          <h3 class="font-semibold mt-6 lasalle-green-text">Additional Requirements for BMS and Night High School Learners</h3>
          <ul class="list-disc ml-6">
            <li>Report Card – No grade below 80%, General Average at least 85%</li>
            <li>Family Constellation Form</li>
            <li>Light & Water Bills (3 successive months)</li>
            <li>Sketch of Residency for Home Visitation</li>
            <li>Employment or income documents (if applicable)</li>
            <li>4Ps ID/Certification (optional)</li>
            <li>Affidavit of Guardianship (if needed)</li>
          </ul>

          <p class="mt-2">
            <strong>Note:</strong> BMS/NHS students must maintain an average of 82%, NO grade below 80%,  
            and deportment grade of at least <strong>Satisfactory (S)</strong>.
          </p>

          <h3 class="font-semibold mt-6 lasalle-green-text">Additional Requirements for Student Transferees</h3>
          <ul class="list-disc ml-6">
            <li>ESC Certificate (if applicable)</li>
            <li>NAT Result (Grades 8–10)</li>
            <li>NCAE Result (Grades 10–11)</li>
          </ul>

          <h3 class="font-semibold mt-6 lasalle-green-text">Additional Requirements for Incoming Grade 11 Students</h3>
          <ul class="list-disc ml-6">
            <li>NCAE Result for Grade 11</li>
            <li>ESC Certificate</li>
            <li>Voucher Certificate (for private non-ESC schools)</li>
          </ul>

          <h3 class="font-semibold mt-6 lasalle-green-text">Additional Requirements for Foreign Nationals</h3>
          <ul class="list-disc ml-6">
            <li>Alien Certificate of Registration (ACR)</li>
            <li>Student Permit from DepEd</li>
            <li>Photocopy of passport</li>
            <li>
              Certificate of Recognition as Filipino citizen  
              (from Bureau of Immigration and Deportation, if applicable)
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
  color: #0b6b40; /* LSU green */
}
</style>
