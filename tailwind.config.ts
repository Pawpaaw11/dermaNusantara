import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-primary-fixed": "#08104f",
        primary: "#1A237E",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#f1efea",
        "tertiary-fixed": "#f8df86",
        "surface-container-low": "#f7f5f0",
        "surface-dim": "#e2dfd8",
        "on-secondary-fixed-variant": "#00524a",
        "secondary-container": "#c8f2ee",
        secondary: "#80CBC4",
        "on-secondary-container": "#00524a",
        "on-background": "#1b1c1a",
        tertiary: "#D4AF37",
        outline: "#8b8986",
        "on-tertiary-fixed-variant": "#574500",
        "secondary-fixed-dim": "#80CBC4",
        "on-primary-container": "#eef0ff",
        "error-container": "#ffdad6",
        "surface-container-high": "#ebe8e2",
        "on-tertiary-fixed": "#241a00",
        "primary-fixed": "#e5e8ff",
        "surface-container-highest": "#e5e2dc",
        background: "#FDFBF7",
        "surface-bright": "#FDFBF7",
        error: "#ba1a1a",
        "on-secondary": "#00201d",
        "on-surface-variant": "#454652",
        "tertiary-fixed-dim": "#D4AF37",
        "on-primary-fixed-variant": "#1A237E",
        "primary-fixed-dim": "#bec4ff",
        surface: "#FDFBF7",
        "on-surface": "#1b1c1a",
        "on-primary": "#ffffff",
        "on-tertiary-container": "#4e3d00",
        "inverse-surface": "#30312e",
        "on-error-container": "#93000a",
        "on-error": "#ffffff",
        "primary-container": "#101965",
        "on-secondary-fixed": "#00201e",
        "surface-tint": "#1A237E",
        "inverse-primary": "#bdc2ff",
        "on-tertiary": "#1b1c1a",
        "outline-variant": "#d1cec8",
        "tertiary-container": "#D4AF37",
        "surface-variant": "#e8e5df",
        "inverse-on-surface": "#f2f0ed",
        "secondary-fixed": "#80CBC4",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        gutter: "24px",
        unit: "8px",
        "margin-desktop": "40px",
        "margin-mobile": "16px",
        "container-max": "1280px",
        "section-gap": "80px",
      },
      fontFamily: {
        "label-md": ["var(--font-figtree)"],
        "headline-md-mobile": ["var(--font-nunito-sans)"],
        "body-md": ["var(--font-figtree)"],
        "headline-sm": ["var(--font-nunito-sans)"],
        "body-lg": ["var(--font-figtree)"],
        "display-lg": ["var(--font-nunito-sans)"],
        "headline-md": ["var(--font-nunito-sans)"],
        "display-lg-mobile": ["var(--font-nunito-sans)"],
        "label-sm": ["var(--font-figtree)"],
      },
      fontSize: {
        "label-md": [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
        "headline-md-mobile": [
          "24px",
          {
            lineHeight: "32px",
            fontWeight: "700",
          },
        ],
        "body-md": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "400",
          },
        ],
        "headline-sm": [
          "24px",
          {
            lineHeight: "32px",
            fontWeight: "700",
          },
        ],
        "body-lg": [
          "18px",
          {
            lineHeight: "28px",
            fontWeight: "400",
          },
        ],
        "display-lg": [
          "48px",
          {
            lineHeight: "56px",
            fontWeight: "800",
          },
        ],
        "headline-md": [
          "32px",
          {
            lineHeight: "40px",
            fontWeight: "700",
          },
        ],
        "display-lg-mobile": [
          "32px",
          {
            lineHeight: "40px",
            fontWeight: "800",
          },
        ],
        "label-sm": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "500",
          },
        ],
      },
    },
  },
  plugins: [forms, containerQueries],
};

export default config;
