/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#030712',
          card: 'rgba(17, 24, 39, 0.65)',
          primary: '#c084fc', // neon purple
          secondary: '#22d3ee', // neon cyan
          accent: '#f43f5e', // neon rose
        }
      },
      boxShadow: {
        'neon-purple': '0 0 8px rgba(168, 85, 247, 0.35), 0 0 20px rgba(168, 85, 247, 0.15)',
        'neon-cyan': '0 0 8px rgba(34, 211, 238, 0.35), 0 0 20px rgba(34, 211, 238, 0.15)',
        'neon-pink': '0 0 8px rgba(244, 63, 94, 0.35), 0 0 20px rgba(244, 63, 94, 0.15)',
      }
    },
  },
  plugins: [],
}
