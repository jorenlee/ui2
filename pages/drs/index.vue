<script setup>
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <Breadcrumb
      :breadcrumbItems="[
        { label: 'Document Review Sheet', url: '/drs' }
      ]"
      :actionButtons="[
        { label: 'Demo Guide', url: '/drs/guide', icon: 'fa fa-video-camera' },
        { label: 'Track', url: '/drs/track', icon: 'fa fa-universal-access' },
        { label: 'Admin Login', url: '/drs/login', icon: 'fa fa-user' }
      ]"
    />
    <SuperAdminDashboardServicesDrsForm/>
    <Footer />
  </div>
</template>
<style scoped>  
</style>
