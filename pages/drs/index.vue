<!-- <script setup>
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <Breadcrumb
      :breadcrumbItems="[
        { label: 'Document Review Sheet', url: '/drs' }
      ]"
      :actionButtons="[
        { label: 'Login', url: '/login', icon: 'fa fa-user' }
      ]"
    />
    <SuperAdminDashboardServicesDrsForm/>
    <Footer />
  </div>
</template> -->

<template>
  <div>
    <UniversityLogin title="Login"  routeURL="/dashboard" />
  </div>
</template>
