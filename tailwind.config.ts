import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#1A1F2C",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#403E43", // More sophisticated dark charcoal
          hover: "#2D2B30",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#7E69AB", // Muted purple for professionalism
          hover: "#6d5899",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#0EA5E9", // Professional blue
          hover: "#0284C7",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#221F26",
          foreground: "#ffffff",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(155, 135, 245, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(155, 135, 245, 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-out forwards",
        glow: "glow 3s ease-in-out infinite",
      },
      backgroundImage: {
        'tech-pattern': 'linear-gradient(90deg, rgba(26,31,44,0.95) 0%, rgba(34,31,38,0.95) 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;