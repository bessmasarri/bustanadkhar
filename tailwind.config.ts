import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-cairo)", "sans-serif"],
                amiri: ["var(--font-amiri)", "serif"],
            },
            colors: {
                garden: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    500: '#22c55e',
                    700: '#15803d',
                },
                morning: {
                    start: '#fef3c7', // Amber 100
                    end: '#bae6fd',   // Sky 200
                },
                evening: {
                    start: '#1e1b4b', // Indigo 950
                    end: '#4c1d95',   // Violet 900
                }
            }
        },
    },
    plugins: [],
};
export default config;
