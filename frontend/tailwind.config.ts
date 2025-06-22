import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tailwind will scan these files
  ],
  theme: {
    extend: {},
  },
  plugins: [typography],
};
