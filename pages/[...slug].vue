<script setup>
import { onMounted } from 'vue';

// Automatically redirect to landing page
onMounted(() => {
  // Immediate redirect for catch-all routes
  navigateTo('/', { replace: true });
});
</script>

<template>
  <div class="redirect-container">
    <div class="content">
      <img
        src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/lsu-logotype-green.png"
        alt="La Salle University"
        class="logo"
      />
      <div class="spinner">
        <i class="fa fa-spinner fa-spin"></i>
      </div>
      <p class="redirect-text">Redirecting to homepage...</p>
    </div>
  </div>
</template>

<style scoped>
.redirect-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  padding: 2rem;
}

.content {
  background: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.logo {
  width: 250px;
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-in;
}

.spinner {
  font-size: 3rem;
  color: #1a5f3a;
  margin-bottom: 1.5rem;
}

.redirect-text {
  font-size: 1.1rem;
  color: #1a5f3a;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .logo {
    width: 200px;
  }

  .spinner {
    font-size: 2.5rem;
  }

  .redirect-text {
    font-size: 1rem;
  }

  .content {
    padding: 2rem 1.5rem;
  }
}
</style>

