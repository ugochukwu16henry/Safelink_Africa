import type { Config } from 'tailwindcss';

/** SafeLink Africa design tokens — see docs/DESIGN.md */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Safety & Trust
        'safe-teal': '#0D5C4A',
        'teal-light': '#0F7A62',
        'teal-soft': '#E8F5F2',
        // Secondary — Energy & Hope
        amber: {
          DEFAULT: '#E8A317',
          light: '#F5D88A',
          dark: '#B8820F',
        },
        // Emergency & Alerts
        'sos-red': '#C73E1D',
        'sos-red-light': '#FDE8E5',
        'success-green': '#2D7D46',
        warning: '#C77B1D',
        // Neutrals
        ink: {
          DEFAULT: '#1A1D23',
          soft: '#4A4E58',
          muted: '#7A7F8A',
        },
        cloud: '#E8EAED',
        sky: '#F7F5F2',
        night: '#1A1D23',
        snow: '#FFFFFF',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
