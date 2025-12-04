export default defineNuxtConfig({
  experimental: { appManifest: false },
  devtools: { enabled: false },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'La Salle University - Ozamiz',
      link: [
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css",
        },
        {
          rel: "stylesheet",
          href: "/css/flickity.min.css",
        },
      ],
      script: [
        {
          src: "/js/flickity.pkgd.min.js"
        },
      ]
    },
  },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  googleSignIn: {
    clientId: '818409831356-g3thpiuagqs1oj6sh1bk6j1c25j2m2mk.apps.googleusercontent.com'
  },
  googleAdsense: {
    id: 'ca-pub-2783005418884897'
  },
  build: {
    transpile: ['@vuepic/vue-datepicker']
  },
  vite: {
    vue: {
      script: {
        propsDestructure: true,
        defineModel: true
      },
      template: {
        compilerOptions: {
          isCustomElement: (tag) => false,
          // suppressHydrationMismatch: true
        }
      }
    },
    // Add this to suppress warnings
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress specific warnings from third-party packages
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          warn(warning);
        }
      }
    }
  },
  modules: [
    'nuxt-vue3-google-signin', 
    '@pinia/nuxt', 
    'nuxt-lodash', 
    '@nuxtjs/google-adsense', 
    'nuxt-gtag'
  ],
  gtag: {
    id: 'G-G21JEZYE42'
  },
  nitro: {
    prerender: {
      failOnError: false,
    },
  },
  compatibilityDate: '2025-07-30',
});
