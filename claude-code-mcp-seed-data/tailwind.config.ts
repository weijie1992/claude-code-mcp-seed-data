import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/pages/**/*.{vue,js,ts}',
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.{vue,js,ts}',
    './app/**/*.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
