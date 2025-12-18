import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "user",

  state: () => ({
    user: {
      isAuthenticated: false,
      email: null,
      token: null,
    },

    // CONFIG
    developerEmail: "jorenleeluna24@gmail.com",
    testEmail: "npc@lsu.edu.ph",
    registrarEmail: "registrar@lsu.edu.ph",

    mainDevServer: "https://apipdp.lsu.edu.ph/buang_ka_eyy",
  }),

  getters: {
    isLoggedIn: (state) => state.user.isAuthenticated,
    userEmail: (state) => state.user.email,
  },

  actions: {
    /* ---------------- INIT (RUN ON APP LOAD) ---------------- */
    initStore() {
      if (!process.client) return;

      const token = localStorage.getItem("user.token");
      const email = localStorage.getItem("user.email");

      if (token && email) {
        this.user.token = token;
        this.user.email = email;
        this.user.isAuthenticated = true;
      } else {
        this.clearUser();
      }
    },

    /* ---------------- LOGIN ---------------- */
    setToken(token, email) {
      this.user.token = token;
      this.user.email = email;
      this.user.isAuthenticated = true;

      localStorage.setItem("user.token", token);
      localStorage.setItem("user.email", email);
    },

    /* ---------------- LOGOUT ---------------- */
    removeToken() {
      this.clearUser();
      localStorage.removeItem("user.token");
      localStorage.removeItem("user.email");
    },

    clearUser() {
      this.user.token = null;
      this.user.email = null;
      this.user.isAuthenticated = false;
    },
  },
});
