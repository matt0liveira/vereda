/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT:      '#EA580C',
          dark:         '#C2410C',
          light:        '#FED7AA',
          muted:        '#FFF1E8',
          'muted-text': '#9A3412',
        },
        surface: {
          bg:             '#FFFAF5',
          DEFAULT:        '#FFFFFF',
          border:         '#E7D5C7',
          'border-filled':'#C8B4A5',
        },
        content: {
          DEFAULT: '#1C1917',
          muted:   '#78716C',
          subtle:  '#A8A29E',
        },
        status: {
          'planned-bg':   '#EFF6FF',
          'planned-text': '#1D4ED8',
          'draft-bg':     '#FFF1E8',
          'draft-text':   '#9A3412',
          'done-bg':      '#F0FDF4',
          'done-text':    '#15803D',
          'error-bg':     '#FEF2F2',
          'error-text':   '#DC2626',
          'error-border': '#FECACA',
        },
      },
    },
  },
  plugins: [],
}
