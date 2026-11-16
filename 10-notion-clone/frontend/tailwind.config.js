/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          sidebar: '#f7f6f3',
          hover: '#e9e8e4',
          border: '#e6e5e0',
          dark: '#37352f',
          textMuted: '#787774',
        },
      },
    },
  },
  plugins: [],
};
