// stores/user.js
import { defineStore } from "pinia";

const TOKEN_LIFETIME = 1000 * 60 * 60 * 24; // 24 hours

export const useUserStore = defineStore({
  id: "user",

  state: () => ({
    user: {
      isAuthenticated: false,
      email: null,
      name: null,
      picture: null,
      token: null,
      expiresAt: null,
    },

    // CONFIG
    developerEmail: "jorenleeluna24@gmail.com",
    testEmail: "npc@lsu.edu.ph",
    registrarEmail: "registrar@lsu.edu.ph",
  }),

  getters: {
    isLoggedIn: (state) => {
      if (!state.user.token || !state.user.expiresAt) return false;
      return Date.now() < state.user.expiresAt;
    },
    userEmail: (state) => state.user.email,
    userName: (state) => state.user.name,
    userPicture: (state) => state.user.picture,
  },

  actions: {
    /* ---------------- INIT (RUN ON APP LOAD) ---------------- */
    initStore() {
      if (!process.client) return;

      const token = localStorage.getItem("user.token");
      const email = localStorage.getItem("user.email");
      const name = localStorage.getItem("user.name");
      const picture = localStorage.getItem("user.picture");
      const expiresAt = localStorage.getItem("user.expiresAt");

      if (!token || !email || !expiresAt) {
        this.clearUser();
        return;
      }

      if (Date.now() > Number(expiresAt)) {
        this.removeToken();
        return;
      }

      this.user = {
        isAuthenticated: true,
        token,
        email,
        name,
        picture,
        expiresAt: Number(expiresAt),
      };
    },

    /* ---------------- LOGIN ---------------- */
    setUser({ token, email, name = null, picture = null }) {
      const expiresAt = Date.now() + TOKEN_LIFETIME;

      this.user = {
        isAuthenticated: true,
        token,
        email,
        name,
        picture,
        expiresAt,
      };

      localStorage.setItem("user.token", token);
      localStorage.setItem("user.email", email);
      localStorage.setItem("user.name", name || "");
      localStorage.setItem("user.picture", picture || "");
      localStorage.setItem("user.expiresAt", expiresAt);
    },

    /* ---------------- LOGOUT ---------------- */
    removeToken() {
      this.clearUser();
      localStorage.removeItem("user.token");
      localStorage.removeItem("user.email");
      localStorage.removeItem("user.name");
      localStorage.removeItem("user.picture");
      localStorage.removeItem("user.expiresAt");
    },

    clearUser() {
      this.user = {
        isAuthenticated: false,
        email: null,
        name: null,
        picture: null,
        token: null,
        expiresAt: null,
      };
    },
  },
});
