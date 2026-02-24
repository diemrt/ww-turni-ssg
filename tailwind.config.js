/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Team member colors from turni.json
        'team-yellow': '#facc15',
        'team-blue': '#3b82f6',
        'team-green': '#22c55e',
        'team-red': '#ef4444',
        'team-orange': '#f97316',
        'team-pink': '#ec4899',
        'team-purple': '#a855f7',
        'team-cyan': '#06b6d4',
        'team-brown': '#92400e',
        'team-gray': '#6b7280',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
