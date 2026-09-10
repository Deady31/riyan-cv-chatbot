import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08090c",
        // Bleu iMessage (mode sombre) — seule couleur d'accent du produit.
        accent: "#0a84ff",
      },
      keyframes: {
        float1: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(3%, 4%) scale(1.06)" },
        },
        float2: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-4%, -3%) scale(1.05)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float1: "float1 22s ease-in-out infinite",
        float2: "float2 26s ease-in-out infinite",
        "fade-up": "fade-up 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
