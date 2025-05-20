import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/**/*.{js,ts,jsx,tsx}",
    "./src/**/**/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#E5E7EB', // gray-200
        background: '#F9FAFB', // gray-50
        foreground: '#191102', // dark text
        primary: '#ffb300', // amber-600
        'primary-foreground': '#fff',
        accent: '#f59e42', // orange-400
        'accent-foreground': '#fff',
        muted: '#f3f4f6', // gray-100
        card: '#fff',
        input: '#fff',
        ring: '#ffb300', // match primary
        'ring-offset': '#F9FAFB', // match background
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
export default config; 