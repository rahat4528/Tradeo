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
        editor: {
          dark: '#1e1e2e',
          surface: '#252538',
          sidebar: '#181825',
          border: '#313244',
          accent: '#cba6f7',
        },
      },
    },
  },
  plugins: [],
};
