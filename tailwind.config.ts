import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium business-media palette
        brand: {
          DEFAULT: "#9b1c1c", // deep editorial red (FT/Economist accent feel)
          50: "#fdf2f2",
          100: "#fadbdb",
          200: "#f4b5b5",
          300: "#e98080",
          400: "#dc4f4f",
          500: "#c62828",
          600: "#9b1c1c",
          700: "#7a1616",
          800: "#5c1010",
          900: "#3d0a0a",
        },
        ink: {
          DEFAULT: "#0a0a0a",
          50: "#f7f7f8",
          100: "#ededf0",
          200: "#d6d6dc",
          300: "#b3b3bd",
          400: "#8a8a98",
          500: "#6b6b78",
          600: "#52525c",
          700: "#3f3f47",
          800: "#27272c",
          900: "#18181b",
          950: "#0a0a0a",
        },
        paper: {
          DEFAULT: "#fffdf9", // warm off-white like FT salmon-adjacent newsprint
          dark: "#0c0c0e",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "8xl": "88rem",
      },
      typography: () => ({
        DEFAULT: {
          css: {
            maxWidth: "68ch",
          },
        },
      }),
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        ticker: "ticker 40s linear infinite",
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
