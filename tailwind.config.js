/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        feasible: { DEFAULT: "#10b981", light: "#d1fae5", text: "#065f46" },
        tight:    { DEFAULT: "#f59e0b", light: "#fef3c7", text: "#92400e" },
        infeasible:{ DEFAULT: "#ef4444", light: "#fee2e2", text: "#991b1b" },
      },
    },
  },
  plugins: [],
}

