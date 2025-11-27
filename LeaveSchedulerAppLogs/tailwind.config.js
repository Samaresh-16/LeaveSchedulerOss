/** @type {import('tailwindcss').Config} */

export default {
	purge: [],
	content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#0070f3",
				secondary: "#1c1c1c",
				accent: "#f5a623",
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
