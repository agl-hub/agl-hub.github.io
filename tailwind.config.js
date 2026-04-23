/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC2626', // AGL Red
          600: '#B91C1C', // AGL Red 2
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        canvas: '#FAFAFA',
        muted: '#F5F5F5',
        body: '#212121',
        line: '#E5E5E5',
        edge: '#D4D4D4',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        pop: '0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 10px -2px rgba(0,0,0,0.05)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

