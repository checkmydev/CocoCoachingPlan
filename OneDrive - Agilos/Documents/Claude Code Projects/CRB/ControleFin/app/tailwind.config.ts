import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'crb-navy': '#1E3A5F',
        'crb-red': '#CE1126',
      },
    },
  },
  plugins: [],
} satisfies Config
