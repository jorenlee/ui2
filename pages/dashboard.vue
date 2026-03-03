<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import userRolesConfig from "@/user-roles-config.json";

const router = useRouter();
const route = useRoute();
const { user, isLoggedIn, setAuth, init } = useAuth();

// ---------------- HANDLE TOKEN FROM URL ----------------
onMounted(() => {
  // Initialize auth from localStorage
  init();

  // Check if we're returning from OAuth callback with token
  const token = route.query.token;

  if (token && typeof token === 'string') {
    // Store the token and decode user info
    setAuth(token);

    // Clean up URL
    router.replace('/dashboard');
  } else if (!isLoggedIn.value) {
    // If no token and not logged in, redirect to login
    router.replace('/cms/login');
  }
});

// ---------------- PROCESS ROLES FROM JSON ----------------
// Build email arrays from JSON configuration
const superAdminEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("superAdmin"))
  .map((user) => user.email);

const npccMenuEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("npccMenu"))
  .map((user) => user.email);

const ochAdminEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("ochAdmin"))
  .map((user) => user.email);

const contentWritersEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("contentWriter"))
  .map((user) => user.email);

const hrMenuEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("hrMenu"))
  .map((user) => user.email);

const libraryMenuEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("libraryMenu"))
  .map((user) => user.email);

const registrarMenuEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("registrarMenu"))
  .map((user) => user.email);

const campusPassAdminEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("campusPassAdmin"))
  .map((user) => user.email);

const drsAdminEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("drsAdmin"))
  .map((user) => user.email);
</script>

<template>
  <div>
    <SuperAdminDashboard
      :superAdminEmails="superAdminEmails"
      :npccMenuEmails="npccMenuEmails"
      :ochAdminEmails="ochAdminEmails"
      :contentWritersEmails="contentWritersEmails"
      :hrMenuEmails="hrMenuEmails"
      :libraryMenuEmails="libraryMenuEmails"
      :registrarMenuEmails="registrarMenuEmails"
      :campusPassAdminEmails="campusPassAdminEmails"
      :drsAdminEmails="drsAdminEmails"
    />
  </div>
</template>

