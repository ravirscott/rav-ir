/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0d1117',
        panel: '#161b22',
        muted: '#8b949e',
        border: '#30363d',
        accent: '#58a6ff'
      },
      boxShadow: {
        glow: '0 10px 30px rgba(88,166,255,0.16)'
      }
    }
  },
  plugins: []
};
