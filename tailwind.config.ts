import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        sub: '#334155',
        line: '#e2e8f0'
      }
    }
  },
  plugins: []
} satisfies Config;
