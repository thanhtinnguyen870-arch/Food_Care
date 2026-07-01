export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF7A00",
        secondary: "#FFB36B",
        healthy: "#26C281",
        cream: "#FFF4D8",
        dark: "#1F2937",
        light: "#F8F9FB",
      },
      boxShadow: {
        '3d': '0 20px 40px -15px rgba(0,0,0,0.1), 0 10px 20px -10px rgba(0,0,0,0.05)',
        'float': '0 30px 60px -20px rgba(255,122,0,0.25)',
      },
    },
  },
  plugins: [],
}
