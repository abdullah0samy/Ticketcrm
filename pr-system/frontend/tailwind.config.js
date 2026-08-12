// tailwind.config.js
const { nextui } = require("@nextui-org/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "0.5rem",
        sm: "1rem",
        lg: "1.5rem",
      },
    
    },
    extend: {
      width: {
        content: `calc(100% - theme("spacing.60"))`,
      },
      height: {
        content:  `calc(100vh - 4.1rem)`,
      },

      keyframes: {
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 0.5 },
        },
        contentShow: {
          from: { opacity: 0, transform: "translateY(15px)" },
          to: { opacity: 1, transform: "translateY(0px)" },
        },
      },
      animation: {
        overlayShow: "overlayShow 0.2s ease-in forwards",
        contentShow: "contentShow 0.3s ease-in forwards",
      },
    },
  },
  darkMode: "class",
  plugins: [
    require("tailwindcss-animate"),
    nextui({
      layout: {
        radius: {
          small: "4px",
          medium: "6px",
          large: "8px",
        },
      },
      themes: {
        light: {
          colors: {
            primary: {
              50: "#eff8ff",
              100: "#def0ff",
              200: "#b6e3ff",
              300: "#75cfff",
              400: "#2cb7ff",
              500: "#00a3ff",
              600: "#007dd4",
              700: "#0063ab",
              800: "#00548d",
              900: "#064674",
              950: "#042c4d",
              DEFAULT: "#00a3ff",
              foreground: "#FFFFFF",
            },
            secondary: {
              50: "#f2f7fd",
              100: "#e4eefa",
              200: "#c3dcf4",
              300: "#8dbfec",
              400: "#519fdf",
              500: "#2d88d4",
              600: "#1b67ae",
              700: "#17528d",
              800: "#174675",
              900: "#193d61",
              950: "#102641",
              DEFAULT: "#2D88D4",
              foreground: "#FFFFFF",
            },
            danger: {
              50: "#fef2f3",
              100: "#fee2e3",
              200: "#fdcbcd",
              300: "#faa7ab",
              400: "#f67379",
              500: "#ec474f",
              600: "#d92932",
              700: "#b61f26",
              800: "#971d23",
              900: "#7d1f24",
              950: "#440b0e",
              DEFAULT: "#ec474f",
              foreground: "#FFFFFF",
            },
          },
        },
      },
    }),
  ],
};