import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F2E8',
        ivory: '#FFFDF8',
        navy: '#0A3456',
        'navy-deep': '#052742',
        gold: '#A97928',
        'gold-soft': '#D7BC85',
        ink: '#14283B',
        mist: '#E8E1D4',
        sky: '#DFE8EC'
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Arial', 'Helvetica', 'sans-serif']
      },
      boxShadow: {
        ticket: '0 24px 70px rgba(5, 39, 66, 0.12)'
      },
      opacity: {
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
        '35': '0.35',
        '45': '0.45',
        '55': '0.55',
        '65': '0.65',
        '68': '0.68'
      }
    }
  },
  plugins: []
};

export default config;
