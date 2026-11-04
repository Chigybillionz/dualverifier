/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        command: {
          950: '#05070e',
          900: '#090d19',
          850: '#0d1324',
          800: '#121a30',
          750: '#182342',
          700: '#1f2d52',
          600: '#2c3e6f',
        },
        glow: {
          blue: '#00d2ff',
          neon: '#00f0ff',
          deep: '#0052ff',
          amber: '#f59e0b',
          crimson: '#ff3366',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(0, 210, 255, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-crimson': '0 0 25px -5px rgba(255, 51, 102, 0.4)',
        'glow-card': '0 10px 40px -10px rgba(0, 112, 243, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-beam': 'borderBeam 4s linear infinite',
      },
      keyframes: {
        borderBeam: {
          '0%': { 'border-color': 'rgba(0, 210, 255, 0.2)' },
          '50%': { 'border-color': 'rgba(0, 210, 255, 0.8)' },
          '100%': { 'border-color': 'rgba(0, 210, 255, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}

