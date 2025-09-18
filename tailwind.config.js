/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FF6B35',
          amber: '#FFB800',
        },
        neutral: {
          background: '#FAFAFA',
          'text-dark': '#2D3748',
          'text-medium': '#4A5568',
          'text-light': '#718096',
        },
        recording: {
          red: '#E53E3E',
        },
        success: {
          green: '#48BB78',
        },
        error: {
          red: '#F56565',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FFB800 0%, #FF6B35 100%)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}