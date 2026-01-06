import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['app/**/*.{test,spec}.{ts,js}', 'tests/unit/**/*.{test,spec}.{ts,js}'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'app/generated/**', 'app/unit/test-utils.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.{ts,vue}'],
      exclude: [
        'node_modules/',
        'app/generated/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/**'
      ]
    }
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '#app': fileURLToPath(
        new URL('./node_modules/nuxt/dist/app', import.meta.url)
      )
    }
  }
});
