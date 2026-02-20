/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1b9302',
                    hover: '#167a02',
                    light: '#22b503',
                }
            }
        },
    },
    plugins: [],
}
