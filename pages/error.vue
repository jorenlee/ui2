<script setup>
import { onMounted } from 'vue';

const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 404, message: 'Page Not Found' }),
  },
});

// Log error for debugging
console.error("Error occurred:", props.error);

// Automatically redirect to landing page after a short delay
onMounted(() => {
  // Redirect to landing page after 2 seconds
  setTimeout(() => {
    navigateTo('/', { replace: true });
  }, 2000);
});

// Function to redirect immediately
const redirectNow = () => {
  navigateTo('/', { replace: true });
};
</script>

<template>
  <div class="not-found-container">
    <div class="content">
      <img
        src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/lsu-logotype-green.png"
        alt="La Salle University"
        class="logo"
      />
      <h1>{{ error?.statusCode || 404 }}</h1>
      <h2>Oops! Page Not Found</h2>
      <p>{{ error?.message || 'The page you are looking for does not exist.' }}</p>

      <div class="redirect-info">
        <p class="redirect-text">
          <i class="fa fa-spinner fa-spin"></i>
          Redirecting to homepage in 2 seconds...
        </p>
        <button @click="redirectNow" class="redirect-button">
          <i class="fa fa-home"></i>
          Go to Homepage Now
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
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
  max-width: 600px;
  width: 100%;
}

.logo {
  width: 250px;
  margin-bottom: 2rem;
}

h1 {
  font-size: 6rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1a5f3a;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #666;
  line-height: 1.6;
}

.redirect-info {
  margin-top: 2rem;
}

.redirect-text {
  font-size: 0.95rem;
  color: #1a5f3a;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.redirect-text i {
  margin-right: 0.5rem;
}

.redirect-button {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #1a5f3a 0%, #2d8659 100%);
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(26, 95, 58, 0.3);
}

.redirect-button:hover {
  background: linear-gradient(135deg, #145030 0%, #1f6b45 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26, 95, 58, 0.4);
}

.redirect-button:active {
  transform: translateY(0);
}

.redirect-button i {
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .logo {
    width: 200px;
  }

  h1 {
    font-size: 4rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  p {
    font-size: 1rem;
  }

  .content {
    padding: 2rem 1.5rem;
  }
}
</style>