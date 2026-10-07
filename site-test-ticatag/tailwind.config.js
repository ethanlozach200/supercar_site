/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0A0F1D', 800: '#0F1629', 700: '#151D35', 600: '#1E2847' },
        brand: { DEFAULT: '#0052FF', 500: '#0066FF' },
        beacon: '#00D2FF',
        ok: '#10B981',
        warn: '#F59E0B',
        signal: '#8B5CF6',
        slate: { 50: '#F8FAFC', 200: '#E2E8F0' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: { to: { transform: 'translateX(-50%)' } },
        ping2: { '75%,100%': { transform: 'scale(2.4)', opacity: '0' } },
      },
      animation: { marquee: 'marquee 38s linear infinite', ping2: 'ping2 1.8s cubic-bezier(0,0,.2,1) infinite' },
    },
  },
  plugins: [],
}
