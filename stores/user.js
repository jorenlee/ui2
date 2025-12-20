import { defineStore } from "pinia";

const TOKEN_LIFETIME = 1000 * 60 * 2;

// 1000 * 60 * 5; // 5 minutes

// 1000 * 60 * 60 * 24; // 24 hours

export const useUserStore = defineStore({
  id: "user",

  state: () => ({
    user: {
      isAuthenticated: false,
      email: null,
      token: null,
      expiresAt: null,
    },

    // CONFIG
    developerEmail: "jorenleeluna24@gmail.com",
    testEmail: "npc@lsu.edu.ph",
    registrarEmail: "registrar@lsu.edu.ph",

    mainDevServer: "https://apipdp.lsu.edu.ph/buang_ka_eyy",
  }),

  getters: {
    isLoggedIn: (state) => {
      if (!state.user.token || !state.user.expiresAt) return false;
      return Date.now() < state.user.expiresAt;
    },
    userEmail: (state) => state.user.email,
  },

  actions: {
    /* ---------------- INIT (RUN ON APP LOAD) ---------------- */
    initStore() {
      if (!process.client) return;

      const token = localStorage.getItem("user.token");
      const email = localStorage.getItem("user.email");
      const expiresAt = localStorage.getItem("user.expiresAt");

      if (!token || !email || !expiresAt) {
        this.clearUser();
        return;
      }

      // Auto logout if expired
      if (Date.now() > Number(expiresAt)) {
        this.removeToken();
        return;
      }

      this.user.token = token;
      this.user.email = email;
      this.user.expiresAt = Number(expiresAt);
      this.user.isAuthenticated = true;
    },

    /* ---------------- LOGIN ---------------- */
    setToken(token, email) {
      const expiresAt = Date.now() + TOKEN_LIFETIME;

      this.user.token = token;
      this.user.email = email;
      this.user.expiresAt = expiresAt;
      this.user.isAuthenticated = true;

      localStorage.setItem("user.token", token);
      localStorage.setItem("user.email", email);
      localStorage.setItem("user.expiresAt", expiresAt);
    },

    /* ---------------- LOGOUT ---------------- */
    removeToken() {
      this.clearUser();
      localStorage.removeItem("user.token");
      localStorage.removeItem("user.email");
      localStorage.removeItem("user.expiresAt");
    },

    clearUser() {
      this.user.token = null;
      this.user.email = null;
      this.user.expiresAt = null;
      this.user.isAuthenticated = false;
    },
  },
});
