import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        docflow: {
          navy: "#065373",
          "navy-dark": "#043c53",
          "navy-light": "#0a6d96",
          slate: "#226a8b",
          teal: "#3f81a3",
          sky: "#5b98bb",
          "light-sky": "#77afd3",
          ice: "#eef6fa",
          "ice-50": "#f5f9fc",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
