import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Kanit"', ...fontFamily.sans],
      },
      colors: {
        'primary': '#1677ff',
        'success': '#52c41a',
        'warning': '#faad14',
        'error': '#f5222d',
        'link': '#1677ff',
      }
    },
  },
  plugins: [],
}