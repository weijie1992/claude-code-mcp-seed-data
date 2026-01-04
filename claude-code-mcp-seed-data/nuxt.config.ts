// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils'],
  tailwindcss: {
    // exposeConfig: false,
    configPath: 'tailwind.config.ts',
    cssPath: '~/assets/css/main.css'
    // viewer: false
  },
  ssr: true,
  vite: {
    build: {
      sourcemap: false
    }
  },

  router: {
    options: {
      strict: false
    }
  },

  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  }
});
