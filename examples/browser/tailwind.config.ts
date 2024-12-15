// /** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';

function defineConfig<const T extends Config>(config: T) {
  return config;
}

export default defineConfig({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
});
