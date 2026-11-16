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
        trello: {
          blue: '#0079bf',
          green: '#519839',
          orange: '#d29034',
          red: '#b04632',
          purple: '#89609e',
          pink: '#cd5a91',
          lime: '#4bbf6b',
          sky: '#00aecc',
          grey: '#838c91',
        },
      },
    },
  },
  plugins: [],
};
