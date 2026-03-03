export default defineNuxtConfig({
  compatibilityDate: '2025-07-30',
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
  googleAdsense: {
    id: 'ca-pub-5434839287765657'
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
    '@pinia/nuxt',
    'nuxt-lodash',
    '@nuxtjs/google-adsense',
    'nuxt-gtag',
    ['nuxt-google-auth', {
      clientId: process.env.GOOGLE_CLIENT_ID,
    }]
  ],
  gtag: {
    id: 'G-G21JEZYE42'
  },
  nitro: {
    prerender: {
      failOnError: false,
    },
  },
  runtimeConfig: {
    apiBase: (process.env.API_BASE || "http://127.0.0.1:8000").replace(
      /\/$/,
      "",
    ),
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
    },
  },
})