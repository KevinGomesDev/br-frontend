import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        text: "var(--color-text)",
        card: "var(--color-card)",
        primary: "var(--color-primary)",
      },
      fontFamily: {
        base: "var(--font-base)",
      },
    },
  },
  plugins: [],
};

export default config;
