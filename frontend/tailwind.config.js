/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        obsidian: {
          950: '#000000',
          900: '#09090b',
          850: '#111114',
          800: '#18181b',
          750: '#202024',
          700: '#27272a',
          600: '#3f3f46',
        },
        luxury: {
          card: '#0e0e11',
          cardSubtle: '#141418',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(251, 191, 36, 0.3)',
          goldGlow: 'rgba(245, 158, 11, 0.15)',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Pro Text', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'gold-glow': '0 0 25px -4px rgba(245, 158, 11, 0.25)',
        'emerald-glow': '0 0 25px -4px rgba(16, 185, 129, 0.25)',
        'rose-glow': '0 0 25px -4px rgba(244, 63, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
