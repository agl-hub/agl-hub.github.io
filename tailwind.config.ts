import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          900: '#450A0A',
        },
        ink:    '#000000',
        canvas: '#FAFAFA',
        line:   '#F3F4F6',
        muted:  '#F9FAFB',
        edge:   '#E5E7EB',
        body:   '#212121',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        card:  '0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)',
        pop:   '0 25px 50px -12px rgba(0,0,0,0.25)',
        chip:  '0 1px 2px 0 rgba(0,0,0,0.05)',
        glow:  '0 10px 30px rgba(220,38,38,0.35)',
      },
      keyframes: {
        floatY: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: { floatY: 'floatY 6s ease-in-out infinite' },
    },
  },
  plugins: [],
} satisfies Config;
