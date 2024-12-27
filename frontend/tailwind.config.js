/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // All React components
    "./public/index.html", // Optional, for HTML files in the public folder
  ],
  theme: {
    extend: {
      fontFamily: {
        head: "Poppins, sans-serif", //font-heading
        body: "Poppins, sans-serif", //font-heading
      },
      colors: {
        dark: "#111111",
        tablebg: "#17181B",
        green: "#AFDFB6",
        greenbg: "#2E3D34",
        gray: "#9AA0AA",
        gray2: "#5C6068",
        ash: "#f5f5f5",
      },
    },
  },
  plugins: [],
};
