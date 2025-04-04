const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        red: {
          400: '#f21b16',
          500: '#BF211E',
          600: '#8f1917',
        },
        // blue: {
        //   500: '#004b76',
        //   600: '#013e61',
        // },
        purple: {
          400: '#986dd1',
          500: '#6e4b9c',
          600: '#5b3a87',
        },
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;