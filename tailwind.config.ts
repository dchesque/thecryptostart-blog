import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crypto: {
          dark: '#1A2A2F',
          darker: '#050816',
          primary: '#FF7400',
          accent: '#E66900',
          success: '#1B7D4B',
          warning: '#f59e0b',
          danger: '#FF6B6B',
          navy: '#1A2A2F',
          charcoal: '#333333',
          light: '#F7F7F7',
          bitcoin: '#FF7400',
          ethereum: '#0071C3',
          invest: '#7B3FF2',
          finance: '#FF1493',
          press: '#FF6B6B',
          products: '#1B7D4B',
        },
      },
      fontFamily: {
        sans: ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'Gilroy', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        '2xl': '24px',
        '3xl': '32px',
        '5xl': '48px',
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: theme('colors.crypto.charcoal'),
            a: {
              color: theme('colors.crypto.primary'),
              '&:hover': { color: theme('colors.crypto.accent') },
            },
            h1: { fontFamily: theme('fontFamily.heading') },
            h2: { fontFamily: theme('fontFamily.heading') },
            h3: { fontFamily: theme('fontFamily.heading') },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
