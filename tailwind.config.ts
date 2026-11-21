import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          bg: "#FAF8F5",
          card: "#FFFFFF",
          secondary: "#F3EFE8",
          primary: "#1B4332",
          "primary-hover": "#2D6A4F",
          accent: "#C85A32",
          "accent-hover": "#B04A26",
          text: "#1C1917",
          "text-muted": "#57534E",
          border: "#E6E1D6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-plus-jakarta-sans)", "sans-serif"],
      },
      boxShadow: {
        warm: "0 1px 3px 0 rgba(28, 25, 23, 0.05), 0 1px 2px -1px rgba(28, 25, 23, 0.05)",
        "warm-md": "0 4px 6px -1px rgba(28, 25, 23, 0.07), 0 2px 4px -2px rgba(28, 25, 23, 0.05)",
        "warm-lg": "0 10px 15px -3px rgba(28, 25, 23, 0.08), 0 4px 6px -4px rgba(28, 25, 23, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
