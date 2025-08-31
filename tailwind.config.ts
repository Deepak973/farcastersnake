import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 *
 * This configuration uses the new 4-color palette:
 * - #000000 (black) → base color for text and dark backgrounds
 * - #CF0F47 (deep pink-red) → primary brand color
 * - #FF0B55 (bright pink-red) → highlight and call-to-action color
 * - #FFDEDE (soft pink) → background for sections/cards
 */
export default {
  darkMode: "media",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New 4-color palette
        black: "#000000",
        "deep-pink": "#CF0F47", // Primary brand color
        "bright-pink": "#FF0B55", // Highlight and CTA color
        "soft-pink": "#FFDEDE", // Background for sections/cards

        // Semantic color mappings
        primary: "#CF0F47", // Deep pink for primary elements
        "primary-light": "#FF0B55", // Bright pink for hover states
        "primary-dark": "#000000", // Black for dark sections

        // Background colors
        background: "#FFDEDE", // Soft pink for main backgrounds
        "background-dark": "#000000", // Black for dark sections

        // Text colors
        text: "#000000", // Black text on light backgrounds
        "text-light": "#FFDEDE", // Light text on dark backgrounds

        // Legacy CSS variables for backward compatibility
        foreground: "var(--foreground)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Custom spacing for consistent layout
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      // Custom container sizes
      maxWidth: {
        xs: "20rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
