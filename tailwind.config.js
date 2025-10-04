/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        fg: "var(--fg)",
        bgc: "var(--bg)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        muted: "var(--muted)",
        card: "var(--card)",
      },
      boxShadow: {
        elev: "0 10px 30px rgba(0,0,0,.25)",
      },
      keyframes: {
        dot: {
          "0%,80%,100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-5px)" },
        },
      },
      animation: { dot: "dot 1.1s infinite ease-in-out" },
    },
  },
  // لا تضع content في v4
  plugins: [],
};
