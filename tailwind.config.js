/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Hanken Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'caption': ['0.8125rem', { lineHeight: '1.45', letterSpacing: '0.01em', fontWeight: '500' }],
        'mono-num': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      colors: {
        // Warm-ink neutrals
        ink: {
          950: '#17151C',
          800: '#2A2733',
          600: '#4A4652',
          400: '#8B8794',
        },
        line: '#E9E6E1',
        paper: '#FBFAF9',
        surface: '#FFFFFF',
        // Brand (liturgical violet)
        brand: {
          50: '#EEEBF6',
          600: '#5A4B9C',
          700: '#4A3D85',
        },
        // Live/today (gold)
        live: {
          DEFAULT: '#E0A43B',
          50: '#FBF2DE',
        },
        // Semantics
        positive: {
          DEFAULT: '#3B8A6B',
          50: '#E7F1EC',
        },
        attention: {
          DEFAULT: '#C4623C',
          50: '#F7E9E2',
        },

        // Person colors (Call Sheet) - nested shade groups for dot/border (500)
        // and tint backgrounds (100, 50) meant to carry dark ink text.
        'person-yellow': { 50: '#FDF8EF', 100: '#F9EFDC', 500: '#E0A43B' },
        'person-blue': { 50: '#EFF5FE', 100: '#DCE9FD', 500: '#3B82F6' },
        'person-green': { 50: '#EEF7F3', 100: '#DAEEE5', 500: '#2F9E6E' },
        'person-red': { 50: '#FDF1F1', 100: '#F9E0E0', 500: '#E05252' },
        'person-orange': { 50: '#FDF4EF', 100: '#F9E7DB', 500: '#E07B39' },
        'person-pink': { 50: '#FCF1F6', 100: '#F8E0EB', 500: '#D8508F' },
        'person-purple': { 50: '#F6F2FC', 100: '#EAE2F8', 500: '#8A5CD8' },
        'person-cyan': { 50: '#EDF8FA', 100: '#D6EFF4', 500: '#1CA6C4' },
        'person-brown': { 50: '#F7F3EF', 100: '#EDE4DC', 500: '#9A6A3A' },
        'person-gray': { 50: '#F3F4F5', 100: '#E4E6E8', 500: '#6B7280' },

        // Legacy accent aliases - map to the new palette so existing
        // components stay non-regressing (removed in a later issue).
        'accent-success': '#3B8A6B', // = positive
        'accent-info': '#3B82F6',
        'accent-warning': '#E0A43B', // = live

        // Legacy team colors - kept for existing components (removed in a later issue)
        'team-yellow': '#fbbf24',
        'team-blue': '#60a5fa',
        'team-green': '#34d399',
        'team-red': '#f87171',
        'team-orange': '#fb923c',
        'team-pink': '#f472b6',
        'team-purple': '#c084fc',
        'team-cyan': '#22d3ee',
        'team-brown': '#a16207',
        'team-gray': '#94a3b8',
      },
      borderRadius: {
        'sm2': '6px',
        'md2': '10px',
        'lg2': '14px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(23, 21, 28, 0.06), 0 1px 3px 0 rgba(23, 21, 28, 0.04)',
        'raised': '0 4px 10px -2px rgba(23, 21, 28, 0.10), 0 2px 4px -2px rgba(23, 21, 28, 0.06)',
        'overlay': '0 20px 40px -10px rgba(23, 21, 28, 0.25), 0 8px 16px -8px rgba(23, 21, 28, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
