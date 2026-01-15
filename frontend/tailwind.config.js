/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {
      colors: {
        // DESCO Brand Colors
        desco: "#0a58ca",        // Primary blue
        descoLight: "#f8fbff",  // Background
        descoDark: "#0f172a",   // Text dark
        descoSoft: "#e0edff",   // Soft blue
      },

      boxShadow: {
        desco: "0 10px 25px rgba(10,88,202,0.15)"
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      }
    }
  },

  plugins: []
};
