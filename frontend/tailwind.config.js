/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SkyEast Brand Colors
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc2fc',
          400: '#36a0fa',
          500: '#4A90E2', // Main Logo Blue
          600: '#006fee',
          700: '#0058c4',
          800: '#064b9a',
          900: '#0b3f7d',
        },
        accent: {
          50: '#fff4ed',
          100: '#ffe6d4',
          200: '#ffd2a8',
          300: '#ffb370',
          400: '#FF6B35', // Main Logo Orange
          500: '#f24a0d',
          600: '#c23305',
          700: '#9a2609',
        },
        // Re-mapping primary to brand for compatibility, but encouraging use of 'brand'
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#36a0fa',
          600: '#4A90E2',
          700: '#006fee',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(74, 144, 226, 0.35)',
        'glow-accent': '0 0 20px rgba(255, 107, 53, 0.35)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
