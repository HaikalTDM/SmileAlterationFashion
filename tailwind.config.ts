import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A84FF',
        success: '#30D158',
        warning: '#FFD60A',
        error: '#FF453A',
        neutral: {
          0: '#FFFFFF',
          100: '#F9F9F9',
          200: '#F2F2F7',
          400: '#E5E5EA',
          600: '#C6C6C8',
          800: '#636366',
          1000: '#1C1C1E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12.8px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['20px', '28px'],
        'xl': ['25px', '32px'],
        '2xl': ['31.25px', '40px'],
        '3xl': ['39.06px', '48px'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '48px',
        '8': '64px',
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 hsl(220 15% 5% / 0.05), 0 1px 3px 0 hsl(220 15% 5% / 0.1)',
        'md': '0 4px 6px -1px hsl(220 15% 5% / 0.1), 0 2px 4px -2px hsl(220 15% 5% / 0.1)',
        'lg': '0 10px 15px -3px hsl(220 15% 5% / 0.1), 0 4px 6px -4px hsl(220 15% 5% / 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;

