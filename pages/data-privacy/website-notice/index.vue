<script setup>
const info = ref(
  [
    {
      link: "/data-privacy/website-notice",
      title: "LSU Website Notice",
      active: true
    },
    {
      link: "https://docs.google.com/document/d/1SCfXJY8BKor6-_t3ffAFGAR67cpZQTa-/edit",
      title: "LSU Privacy Policy",
      active: false
    },
    {
      link: "https://docs.google.com/document/d/1aVCsOp15mBTzpYOMJheT7EUK5ePg1MYzkvDBPZpW94g/edit?tab=t.0",
      title: "LSU Privacy Statement",
      active: false
    },
    {
      link: "https://drive.google.com/drive/folders/1-rUQpacYC1eqG4myXwKb1UKDc_8V4pJ6",
      title: "LSU Privacy Notices",
      active: false
    },
    {
      link: "https://docs.google.com/document/d/1LsBHezVAYctOL7NgYRXX1vb75qUFVkSM/edit",
      title: "LSU Data Privacy Forms",
      active: false
    },
    {
      link: "/directory",
      title: "LSU Privacy Contact Details",
      active: false
    },
  ]
)


</script>

<template>
  <div class="bg-gray-50 font-montserrat">
    <Header />


    <div class="text-center  lg:pt-28 pt-20 lg:pb-5 pb-4 text-white lg:bg-green-800 bg-green-950 border-b-4 border-green-600">
        <img class="lg:w-20 w-14 mx-auto mb-2"
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-logo.png" />
        <h1 class="capitalize  text-lg">la salle university</h1>
        <h1 class=" text-lg tracking-widest font-semibold uppercase lg:flex block mx-auto lg:w-fit">
          <span class="lg:flex block text-[18px] leading-[20px] tracking-normal">Data Privacy</span>
        </h1>
      </div>
    
    <div class="lg:flex ">






        <div class="w-full lg:order-2 order-1"> 

<div class="md:flex">
    <div class="w-11/12 lg:shadow lg:py-10 md:px-14 py-5 mx-auto">
      <h1 class="font-bold mb-2 text-base">Statement of Policy</h1>
      <p class="mb-2  text-xs">
        La Salle University is committed to protect and respect your personal data privacy
        by implementing and complying with the Data Privacy Act of 2012. Personal
        Information Collection Consent form is provided whenever personal data is
        collected.
      </p>
      <h1 class="lg:w-10/12 text-[16px] leading-[20px] font-bold mt-5 uppercase">
        Privacy Notice For processing inquiries and requests
      </h1>
      <h1 class="font-bold">Personal Data Collected</h1>
      <p class=" text-xs">
        We collect the following personal information from you when you electronically
        submit to us your inquiries or requests:
      </p>
      <ul class="ml-14 mt-2 list-disc">
        <li class="text-xs">Name</li>
        <li class="text-xs">Student ID number</li>
        <li class="text-xs">Email</li>
        <li class="text-xs">Contact number</li>
      </ul>
      <h1 class="mt-5 font-bold text-base">Use</h1>
      <p class="mb-5  text-xs">
        The collected personal information is utilized solely for documentation and
        processing purposes within the LSU and is not shared with any outside parties.
        They enable us to properly address the inquiries and requests, forward them to
        appropriate internal units for action and response, and provide clients with
        appropriate updates and advisories in a legitimate format and in an orderly and
        timely manner.
      </p>
      <h1 class="mt-5 font-bold text-base">Protection Measures</h1>
      <p class=" text-xs">
        Only authorized LSU personnel have access to these personal information, the
        exchange of which will be facilitated through email and/or hard copy. They will be
        stored in a database for two years (after inquiries, requests are acted upon)
        after which physical records shall be disposed of through shredding, while digital
        files shall be anonymized.
      </p>
      <h1 class="mt-5 font-bold text-base ">Access and Correction</h1>
      <p class=" text-xs">
        You have the right to ask for a copy of any personal information we hold about
        you, as well as to ask for it to be corrected if you think it is wrong. To do so,
        please contact our Data Privacy and Compliance Officer, Mr. Israel Gallogo, through the following email address: president@lsu.edu.ph.
      </p>
      <h1 class="mt-5 font-bold text-base">Feedback on our Privacy Notice</h1>
      <p class=" text-xs">
        If you have suggestions with regards to our privacy notice, you may reach us
        through president@lsu.edu.ph. Kindly include in your message the following details:
        name, email, concern/s, and explanation of your concern with specific details.
      </p>
    </div>
    <div class="lg:shadow px-20 lg:py-10 pt-1 pb-7">
      <img
        src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/NPCSeal.png" class="w-[300px] mx-auto"/>
    </div>
  </div> 



</div>

   

<div class="lg:w-4/12  bg-green-950 lg:order-1 order-2"> 

<div class="">
  <div class="w-11/12 mx-auto lg:py-10 py-5">
    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-white.png" class="lg:w-5/12 w-4/12 mx-auto"/>
  </div>
</div>
<div class=" lg:pb-10 pb-5">
  <ul class=" gap-10 w-10/12 mx-auto">
    <li v-for="(j,i) in info" :key="i">
      <a :href="j.link"
        target="_blank"
        class="w-full flex items-center cursor-pointer lg:mb-5 mb-3 rounded-full   lg:py-2 py-1 px-3 hover:font-bold"
        
        :class="j.active ? 'font-bold bg-green-700 text-white' : 'bg-white hover:bg-green-800 text-green-950 hover:text-white'"
        >
        <span class="lg:py-0 py-0.5 bg-green-800 hover:bg-white rounded-full lg:px-2 px-2 text-white hover:text-green-800">
          <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </span>
        <span class="lg:ml-5 ml-4 lg:text-sm text-xs">
          {{ j.title }}
        </span>
      </a>
    </li>
  </ul>
</div>

</div>



    </div>
    <Footer />
























    
  </div>
</template>

<style></style>