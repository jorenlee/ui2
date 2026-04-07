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
          <h2 class="lasalle-green-text font-bold text-xl">Basic Education Scholarships and Grants</h2>
          <p>The LSU Basic Education Unit offers scholarship grants from endowments and the university’s scholarship fund. A student may avail of only one scholarship at a time.</p>

          <!-- I. Institutional Scholarships -->
          <h3 class="lasalle-green-text font-semibold mt-4">I. Institutional Scholarships</h3>

          <h4 class="font-semibold">1. Academic Scholarships</h4>
          <p><strong>Incoming Grade 7 and Grade 11</strong></p>
          <ul class="list-disc ml-10">
            <li><strong>Valedictorian (or equivalent):</strong> Free tuition and school fees for one school year</li>
            <li><strong>Salutatorian (or equivalent):</strong> 50% discount on tuition and school fees for one school year</li>
            <li><strong>Requirement:</strong> Certificate signed by school principal; must be from a batch of at least 50 students</li>
          </ul>

          <p><strong>Old / Resident Students (JHS & SHS)</strong></p>
          <ul class="list-disc ml-10">
            <li>With <strong>Highest Honors</strong> – 50% tuition discount</li>
            <li>With <strong>High Honors</strong> – 25% tuition discount</li>
            <li>With <strong>Honors</strong> – 15% tuition discount</li>
          </ul>

          <h4 class="font-semibold mt-3">2. Special Academic Scholarship</h4>
          <p>Intended for students with satisfactory academic standing but financially challenged.</p>
          <ul class="list-disc ml-10">
            <li>Academic average of at least <strong>89%</strong></li>
            <li>No grade below <strong>85%</strong></li>
            <li>Deportment grade: <strong>Very Satisfactory</strong></li>
            <li>Financial incapacity (BIR exemption, indigency, employment certificate)</li>
            <li>Average or above entrance exam rating</li>
            <li>Continuing student GPA: at least <strong>85%</strong></li>
          </ul>
          <p><strong>Procedures:</strong></p>
          <ul class="list-disc ml-10">
            <li>Write an application letter to the Chancellor</li>
            <li>Accomplish forms at the Registrar’s Office</li>
          </ul>

          <!-- II. Grant-In-Aid -->
          <h3 class="lasalle-green-text font-semibold mt-6">II. Grant-In-Aid</h3>

          <h4 class="font-semibold">1. Education Service Contracting (ESC)</h4>
          <p>A government subsidy program for incoming Grade 7 to Grade 10 students.</p>
          <p><strong>Requirement:</strong> Latest Income Tax Return or BIR Certificate of Exemption</p>

          <h4 class="font-semibold mt-3">2. Brother Martin Simpson FSC (BMS) Sections Scholarship</h4>
          <ul class="list-disc ml-10">
            <li>Must pass exam and interview</li>
            <li>Submit all required enrollment documents</li>
            <li>Limit: <strong>2 BMS scholars per family</strong></li>
          </ul>

          <h4 class="font-semibold mt-3">3. Senior High School Voucher Program</h4>
          <p><strong>Automatically Qualified:</strong></p>
          <ul class="list-disc ml-10">
            <li><strong>Public JHS students:</strong> 100% voucher value</li>
            <li><strong>ESC JHS students:</strong> 80% voucher value</li>
          </ul>
          <p><strong>Required Documents:</strong></p>
          <ul class="list-disc ml-10">
            <li>2 pcs 2x2 ID photos</li>
            <li>PSA Birth Certificate</li>
            <li>Grade 10 Report Card</li>
            <li>Certificate of Employment (if applicable)</li>
            <li>Latest ITR / Tax Exemption / Municipal Certificate</li>
          </ul>

          <!-- III. Special Discounts -->
          <h3 class="lasalle-green-text font-semibold mt-6">III. Special Discounts</h3>

          <h4 class="font-semibold">1. Cash Discount</h4>
          <p>5% discount on tuition and other fees upon full payment within the first month.</p>

          <h4 class="font-semibold mt-3">2. Family Discounts</h4>
          <p>Available for families with multiple enrolled students.</p>

          <h4 class="font-semibold mt-3">3. Lasallian Athletes League Discount</h4>
          <p><em>Temporarily Frozen</em></p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
const menuList = [
  { label: "BEU Programs", link: "/academics/basic-education" },
  { label: "BEU Graduate Attributes", link: "/academics/basic-education/graduate-attributes" },
  { label: "Admissions", link: "/academics/basic-education/admissions" },
  { label: "Scholarships and Grants", link: "/academics/basic-education/scholarships-grants" },
  { label: "Fees and Payments", link: "/academics/basic-education/fees-payments" }
];
</script>

<style scoped>
.lasalle-green-text {
  color: #0b6b40;
}
</style>
