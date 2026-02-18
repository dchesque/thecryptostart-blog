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
            lineHeight: '1.8',
            a: {
              color: theme('colors.crypto.primary'),
              fontWeight: '700',
              textDecoration: 'none',
              '&:hover': { color: theme('colors.crypto.accent') },
            },
            h1: { fontFamily: theme('fontFamily.heading'), color: theme('colors.crypto.navy') },
            h2: {
              fontFamily: theme('fontFamily.heading'),
              color: theme('colors.crypto.navy'),
              paddingBottom: '0.5rem',
              borderBottom: `2px solid ${theme('colors.gray.100')}`,
              marginTop: '2.5rem',
              marginBottom: '1.25rem',
            },
            h3: {
              fontFamily: theme('fontFamily.heading'),
              color: theme('colors.crypto.navy'),
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            p: {
              marginTop: '1rem',
              marginBottom: '1rem',
              lineHeight: '1.8',
            },
            'ul > li': { marginTop: '0.5rem', marginBottom: '0.5rem' },
            'ol > li': { marginTop: '0.5rem', marginBottom: '0.5rem' },
            blockquote: {
              borderLeftColor: theme('colors.crypto.primary'),
              borderLeftWidth: '4px',
              fontStyle: 'italic',
              color: theme('colors.crypto.charcoal'),
              backgroundColor: theme('colors.gray.50'),
              paddingLeft: '1.5rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              borderRadius: '0 0.5rem 0.5rem 0',
            },
            code: {
              backgroundColor: theme('colors.crypto.darker'),
              color: theme('colors.crypto.primary'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '600',
              fontSize: '0.875em',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              backgroundColor: theme('colors.crypto.darker'),
              color: '#e5e7eb',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              overflowX: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              fontSize: '0.875em',
            },
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
