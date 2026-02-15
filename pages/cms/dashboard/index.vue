<script setup>
import userRolesConfig from "@/user-roles-config.json";

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