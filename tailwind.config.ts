import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],  safelist: [
    'bg-primary/10',
    'hover:bg-primary/10',
    'bg-primary/20',
    'bg-base-200/50',
    'hover:bg-base-200/50',
    'animate-fade-in-down',
    'rotate-90',
    'opacity-0',
    'opacity-100',
    'rotate-45',
    'translate-y-2',
    '-rotate-45',
    '-translate-y-2',
    'text-primary',
    'bg-primary',
    'animate-pulse',
    'rotate-90'
  ],
  future: {
    respectDefaultRingColorOpacity: true,
  },
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-slower': 'spin 5s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require("daisyui"),
    function({ addUtilities }: PluginAPI) {
      const newUtilities = {
        '.pattern-dots': {
          'background-image': 'radial-gradient(currentColor 1px, transparent 1px)',
          'background-size': 'calc(10 * 1px) calc(10 * 1px)',
        },
        '.pattern-size-2': {
          'background-size': 'calc(20 * 1px) calc(20 * 1px)',
        },
      };
      addUtilities(newUtilities);
    },
  ],  daisyui: {
    themes: [
      {
        light: {
          primary: "#3b82f6",    // Blue
          secondary: "#8b5cf6",  // Purple
          accent: "#06b6d4",     // Cyan
          neutral: "#1f2937",    // Dark gray
          "base-100": "#ffffff", // White
          "base-200": "#f3f4f6", // Light gray
          "base-300": "#e5e7eb", // Gray
        },
        dark: {
          primary: "#3b82f6",    // Blue
          secondary: "#8b5cf6",  // Purple
          accent: "#06b6d4",     // Cyan
          neutral: "#1f2937",    // Dark gray
          "base-100": "#1e1e2e", // Dark blue-gray
          "base-200": "#181825", // Darker blue-gray
          "base-300": "#11111b", // Almost black
        },
      },
    ],
  },
} satisfies Config;
