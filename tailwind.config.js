/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a1628',
        cream: '#f4f1e8',
        lime: '#c7f36b',
        coral: '#ff7b63'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(6, 16, 29, .12)',
        lift: '0 16px 30px rgba(6, 16, 29, .18)'
      }
    }
  },
  plugins: []
}
