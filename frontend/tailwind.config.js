/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: { DEFAULT: '#EC4899', hover: '#DB2777', light: '#FDF2F8', dark: '#BE185D' },
        brand:   { DEFAULT: '#EC4899', 50: '#FDF2F8', 100: '#FCE7F3', hover: '#DB2777', dark: '#BE185D' },

        // Semantic text
        ink:   { DEFAULT: '#191F28', 2: '#4E5968' },
        muted: '#8B95A1',

        // Semantic surfaces
        bg:      '#F9FAFB',
        surface: '#FFFFFF',
        border:  '#E5E8EB',

        // Accent
        heart: { DEFAULT: '#EF4444', light: '#FEF2F2' },

        // Pin colors
        'slate-pin': '#3B82F6',
        'rose-pin':  '#F472B6',

        // Gray scale
        gray: {
          50:  '#F9FAFB',
          100: '#F2F4F6',
          150: '#EAECEF',
          200: '#E5E8EB',
          300: '#D1D6DB',
          400: '#B0B8C1',
          500: '#8B95A1',
          600: '#6B7684',
          700: '#4E5968',
          800: '#333D4B',
          900: '#191F28',
        },

        // Map pin status colors
        blue: {
          male:    '#3B82F6',
          female:  '#F472B6',
          both:    '#8B5CF6',
          visited: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'xs':    '0 1px 2px 0 rgba(0,0,0,0.04)',
        'sm':    '0 1px 4px 0 rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
        'md':    '0 4px 12px 0 rgba(0,0,0,0.08)',
        'lg':    '0 8px 24px 0 rgba(0,0,0,0.10)',
        'xl':    '0 16px 40px 0 rgba(0,0,0,0.12)',
        'sheet': '0 -2px 20px 0 rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float':     'float 3s ease-in-out infinite',
        'slide-up':  'slideUp 0.26s cubic-bezier(0.32,0.72,0,1)',
        'fade-in':   'fadeIn 0.15s ease-out',
        'ping-slow': 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        slideUp: { from: { transform: 'translateY(100%)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
