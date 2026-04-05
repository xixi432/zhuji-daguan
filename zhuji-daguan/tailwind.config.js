/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lingnan': {
          50: '#fdf8f3',
          100: '#f9efe4',
          200: '#f2dec7',
          300: '#e8c49f',
          400: '#dba372',
          500: '#d1864a',
          600: '#c36b3a',
          700: '#a25330',
          800: '#84432c',
          900: '#6b3826',
        },
        'ink': {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#1a1a1a',
        },
        'paper': '#faf8f5',
      },
      fontFamily: {
        'serif': ['Noto Serif SC', 'SimSun', 'STSong', 'serif'],
        'sans': ['Noto Sans SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
