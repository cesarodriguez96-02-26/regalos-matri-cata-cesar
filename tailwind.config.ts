import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F9F4ED',
        wine: '#7B3143',
        blush: '#E9C7C6',
        sage: '#87967B',
        ink: '#2D2626'
      },
      fontFamily: {
        serif: ['Georgia', 'serif']
      }
    }
  },
  plugins: []
};
export default config;
