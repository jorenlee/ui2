<template>
    <div class="not-found-container">
      <h1>Oops! Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <NuxtLink to="/">Go back to the homepage</NuxtLink>
    </div>
  </template>
  
  <script setup>
  defineProps({
    error: {
      type: Object,
      default: () => ({ statusCode: 404, message: 'Page Not Found' }),
    },
  });
  
  // You can add custom logic here if needed,
  // for example, logging the error or performing specific actions
  console.error("Error occurred:", error);
  </script>
  
  <style scoped>
  .not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    font-family: sans-serif;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
  }
  
  a {
    color: #007bff;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  </style>