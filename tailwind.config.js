/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          950: '#0B0D12',
          900: '#0F1219',
          800: '#161A23',
          700: '#1E232D',
          600: '#272C38',
          500: '#363D4A',
          400: '#5A6473',
          300: '#848D9A',
          200: '#ADB3BE',
          100: '#D4D8DE',
          50: '#EEF0F3',
        },
        ambient: {
          blue: '#4F46E5',
          purple: '#7C3AED',
          cyan: '#06B6D4',
          pink: '#EC4899',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          light: 'rgba(255, 255, 255, 0.06)',
          lighter: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderLight: 'rgba(255, 255, 255, 0.15)',
        },
        primary: {
          DEFAULT: '#4F46E5',
          light: '#6366F1',
          dark: '#4338CA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ambient-gradient': 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.1) 50%, rgba(6, 182, 212, 0.08) 100%)',
      },
      boxShadow: {
        'soft': '0 2px 40px -4px rgba(0, 0, 0, 0.3)',
        'elegant': '0 8px 32px -8px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)',
        'glow': '0 0 40px rgba(79, 70, 229, 0.15)',
      },
      borderRadius: {
        '2xl': '20px',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
