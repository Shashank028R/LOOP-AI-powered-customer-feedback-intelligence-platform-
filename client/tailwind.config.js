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
          bg: '#050a18',
          card: 'rgba(10, 17, 40, 0.45)',
          primary: '#d4af37', // gold
          secondary: '#ffffff', // white
          accent: '#dfb76c', // light gold
        }
      },
      boxShadow: {
        'neon-purple': '0 4px 20px -2px rgba(212, 175, 55, 0.15), 0 0 15px rgba(212, 175, 55, 0.08)',
        'neon-cyan': '0 4px 20px -2px rgba(255, 255, 255, 0.1), 0 0 15px rgba(255, 255, 255, 0.05)',
        'neon-pink': '0 4px 20px -2px rgba(223, 183, 108, 0.15), 0 0 15px rgba(223, 183, 108, 0.08)',
      }
    },
  },
  plugins: [],
}
