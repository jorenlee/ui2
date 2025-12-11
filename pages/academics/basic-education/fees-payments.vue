<script setup>
const menuList = [
  { label: "BEU Programs", link: "/academics/basic-education" },
  { label: "BEU Graduate Attributes", link: "/academics/basic-education/graduate-attributes" },
  { label: "Admissions", link: "/academics/basic-education/admissions" },
  { label: "Scholarships and Grants", link: "/academics/basic-education/scholarships-grants" },
  { label: "Fees and Payments", link: "/academics/basic-education/fees-payments" }
];
</script><template>
  <div class="bg-gray-50">
    <Header />

    <!-- Banner -->
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
          <li><a href="/" class="mr-1">Home</a></li>
          <li>
            <i class="fas fa-caret-right mr-1"></i>
            <a href="/academics/basic-education" class="mr-1">Basic Education</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Side Menu -->
      <div class="shadow lg:w-3/12 my-5 bg-white rounded-lg overflow-hidden">
        <DynamicSideMenu :items="menuList" title="Sub Pages" />
      </div>

      <!-- Main Content -->
      <div class="lg:w-9/12 mx-auto lg:my-5 my-3 prose max-w-full text-justify">
        <div class="bg-white p-6 shadow rounded-lg">
          <h2 class="lasalle-green-text font-bold text-xl">Fees and Payments</h2>

          <p>
            Tuition and special fees are printed on the Statement of Accounts and are
            distributed to parents and guardians prior to or during the enrollment
            period. It is the enrollee’s responsibility to know the prescribed fees,
            scholarship grants, and payment policies.
          </p>

          <h3 class="font-semibold lasalle-green-text mt-4">Mode of Payment</h3>

          <p>Guidelines:</p>
          <ul class="list-disc ml-10">
            <li>
              Resident students and transferees may opt to pay in full (with
              discount) or on an installment basis at the Accounting Office.
            </li>
            <li>Payments may be made in cash, check, or manager’s check.</li>
            <li>Post-dated or overstated checks are not accepted.</li>
            <li>Credit card payments are not accepted.</li>
            <li>
              Checks must be currently dated and not stale (not older than 5 months
              prior to payment).
            </li>
            <li>
              Installment payments must follow the published monthly payment
              schedules.
            </li>
            <li>PLAYGROUP students pay by semester.</li>
            <li>Other modes of payment are available.</li>
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