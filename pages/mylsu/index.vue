<script setup>
const buttons = ref([
  {
    title: 'Administration',
    link: 'http://my.lsu.edu.ph/ADMIN_STAFF/admin_staff_index.jsp',
  },
  {
    title: 'Management',
    link: 'http://my.lsu.edu.ph/administrators/administrators_index.jsp'
  },
  {
    title: 'Academics',
    link: 'http://my.lsu.edu.ph/faculty_acad/faculty_acad_index.jsp'
  },
  {
    title: 'Parents/Students',
    link: 'http://my.lsu.edu.ph/PARENTS_STUDENTS/parents_student_index.jsp'
  },
  {
    title: 'Basic Education',
    link: 'http://my.lsu.edu.ph/sa_basic/admin_staff/admin_staff_index.htm'
  }
])
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="lg:flex w-11/12 mx-auto lg:pl-44 py-10 lg:pt-36 pt-24">
      <div class="lg:w-1/3 lg:pl-10 lg:pb-10 pb-3 lg:order-2 order-1 lg:mt-10">
        <a
          class="rounded-xl px-2 lg:py-3 py-2.5 drop-shadow-xl lg:w-11/12 w-9/12 mx-auto block shadow-xl lg:mb-10 mb-6 whitespace-nowrap bg-white text-green-800 text-xl font-bold text-center"
          v-for="(j,i) in buttons" :key="i"
          :href="j.link"
          >{{j.title}}</a
        >
      </div>
      <div class="lg:w-1/2 my-auto lg:order-1 order-2">
        <img
          class="rounded-full mx-auto lg:w-96 w-7/12"
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
        />
      </div>
    </div>
    <!-- <div>fsdfsdfsfd</div> -->
    <div class="justify-center lg:w-10/12 w-11/12 mx-auto border mb-5" title="Google Ads"> 
      <Adsbygoogle ad-slot="9892943139" />
    </div>
    <!-- <ScriptGoogleAdsense
      data-ad-client="ca-pub-2783005418884897"  
      data-ad-slot="9892943139"           
    /> -->
    <Footer />
  </div>
</template>

<style scoped></style>
