/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kisan: {
          sage: '#7B9669',
          light: '#E6E6E6',
          slateTeal: '#6C8480',
          softSage: '#BAC8B1',
          darkForest: '#404E3B',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#7B9669',
          600: '#404E3B',
          700: '#404E3B',
          800: '#404E3B',
          900: '#404E3B',
          950: '#404E3B',
        },
      },
    },
  },
  plugins: [],
};
