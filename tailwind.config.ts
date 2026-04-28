import type { Config } from 'tailwindcss'

/**
 * Design system — content-hub, reading-first.
 *
 * The palette centers around a soft warm paper (surface-warm) and a deep
 * editorial ink for body. Crypto-* tokens are kept for backwards
 * compatibility with existing components, but new code should prefer the
 * semantic tokens (paper, ink, accent, line, muted, etc.).
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Editorial / reading surface tokens
        paper: '#FFFFFF',
        cream: '#FBF9F4',
        sand: '#F4EFE6',
        line: '#E8E4DB',
        'line-soft': '#F1EDE4',

        // Ink (text)
        ink: '#15151A',
        'ink-soft': '#2D2D33',
        'ink-mute': '#5C5C66',
        'ink-faint': '#9A9AA3',

        // Accent (single warm hue, used sparingly)
        accent: {
          DEFAULT: '#E55A12',
          soft: '#FFF3E8',
          deep: '#B33F00',
          ink: '#7A2A00',
        },

        // Legacy crypto-* tokens (kept so existing components don't break)
        crypto: {
          dark: '#1A2A2F',
          darker: '#0E1014',
          primary: '#E55A12',
          accent: '#B33F00',
          success: '#1B7D4B',
          warning: '#D97706',
          danger: '#DC2626',
          navy: '#15151A',
          charcoal: '#2D2D33',
          light: '#FBF9F4',
          bitcoin: '#E55A12',
          ethereum: '#1F62D9',
          invest: '#5B2DBF',
          finance: '#C2185B',
          press: '#B91C1C',
          products: '#15803D',
        },
      },
      fontFamily: {
        // UI / sans (used by site chrome, cards, navigation)
        sans: ['var(--font-open-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Display / heading (used for titles)
        heading: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Editorial serif (used for article body — the reading hub)
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
      },
      fontSize: {
        // A more comfortable reading scale
        'display-1': ['clamp(2.5rem, 4vw + 1rem, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-2': ['clamp(2rem, 3vw + 1rem, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.018em' }],
        'display-3': ['clamp(1.5rem, 2vw + 1rem, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.012em' }],
        'lede': ['clamp(1.125rem, 0.5vw + 1rem, 1.375rem)', { lineHeight: '1.55' }],
        'reading': ['1.125rem', { lineHeight: '1.75' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        '2xl': '24px',
        '3xl': '32px',
        '5xl': '48px',
        'gap-tight': '8px',
        'gap-normal': '16px',
        'gap-loose': '24px',
        'gap-huge': '32px',
      },
      maxWidth: {
        'reading': '68ch',     // Body text — comfortable line length
        'measure': '72ch',     // Slightly wider for hero / lede
        'post': '720px',       // Article column width
        'hub': '1200px',       // Standard hub container
        'wide': '1320px',      // Wide hub
        'sidebar': '320px',
        '1440': '1440px',
      },
      screens: {
        '2xl': '1440px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1.25rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem',
          '2xl': '3rem',
        },
      },
      boxShadow: {
        'card': '0 1px 2px rgba(15, 15, 20, 0.04), 0 4px 16px rgba(15, 15, 20, 0.04)',
        'card-hover': '0 2px 4px rgba(15, 15, 20, 0.05), 0 16px 40px rgba(15, 15, 20, 0.08)',
        'lift': '0 24px 60px -28px rgba(15, 15, 20, 0.18)',
      },
      borderRadius: {
        'editorial': '20px',
      },
      animation: {
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      typography: (theme: (path: string) => any) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.ink-soft'),
            '--tw-prose-headings': theme('colors.ink'),
            '--tw-prose-lead': theme('colors.ink-soft'),
            '--tw-prose-links': theme('colors.accent.deep'),
            '--tw-prose-bold': theme('colors.ink'),
            '--tw-prose-counters': theme('colors.ink-mute'),
            '--tw-prose-bullets': theme('colors.line'),
            '--tw-prose-hr': theme('colors.line'),
            '--tw-prose-quotes': theme('colors.ink'),
            '--tw-prose-quote-borders': theme('colors.accent.DEFAULT'),
            '--tw-prose-captions': theme('colors.ink-mute'),
            '--tw-prose-code': theme('colors.ink'),
            '--tw-prose-pre-code': '#E5E7EB',
            '--tw-prose-pre-bg': '#0E1014',
            '--tw-prose-th-borders': theme('colors.line'),
            '--tw-prose-td-borders': theme('colors.line-soft'),

            color: theme('colors.ink-soft'),
            fontFamily: theme('fontFamily.serif').join(', '),
            fontSize: '1.125rem',
            lineHeight: '1.8',
            maxWidth: 'none',

            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              lineHeight: '1.8',
              fontSize: '1.125rem',
              color: theme('colors.ink-soft'),
            },
            '[class~="lead"]': {
              fontFamily: theme('fontFamily.serif').join(', '),
              fontSize: '1.375rem',
              lineHeight: '1.6',
              color: theme('colors.ink'),
              fontWeight: '400',
              marginBottom: '1.5em',
            },
            'h1, h2, h3, h4': {
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '700',
              color: theme('colors.ink'),
              letterSpacing: '-0.015em',
            },
            h2: {
              fontSize: '1.875rem',
              marginTop: '2.5em',
              marginBottom: '0.75em',
              lineHeight: '1.2',
              borderBottom: 'none',
              paddingBottom: '0',
            },
            h3: {
              fontSize: '1.375rem',
              marginTop: '2em',
              marginBottom: '0.6em',
              lineHeight: '1.25',
            },
            h4: {
              fontSize: '1.125rem',
              marginTop: '1.6em',
              marginBottom: '0.4em',
            },
            a: {
              color: theme('colors.accent.deep'),
              fontWeight: '500',
              textDecoration: 'underline',
              textDecorationColor: theme('colors.accent.soft'),
              textDecorationThickness: '2px',
              textUnderlineOffset: '3px',
              transition: 'all 0.15s ease',
              '&:hover': {
                color: theme('colors.accent.ink'),
                textDecorationColor: theme('colors.accent.DEFAULT'),
              },
            },
            strong: {
              color: theme('colors.ink'),
              fontWeight: '600',
            },
            'ul > li': { marginTop: '0.5em', marginBottom: '0.5em', paddingLeft: '0.4em' },
            'ol > li': { marginTop: '0.5em', marginBottom: '0.5em', paddingLeft: '0.4em' },
            'ul > li::marker': { color: theme('colors.accent.DEFAULT') },
            'ol > li::marker': { color: theme('colors.ink-mute'), fontWeight: '600' },
            blockquote: {
              borderLeftWidth: '3px',
              borderLeftColor: theme('colors.accent.DEFAULT'),
              fontStyle: 'italic',
              fontWeight: '400',
              color: theme('colors.ink'),
              paddingLeft: '1.5rem',
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem',
              marginTop: '2em',
              marginBottom: '2em',
              backgroundColor: 'transparent',
              borderRadius: '0',
              fontSize: '1.25rem',
              lineHeight: '1.6',
            },
            'blockquote p:first-of-type::before': { content: '""' },
            'blockquote p:last-of-type::after': { content: '""' },
            code: {
              backgroundColor: theme('colors.cream'),
              color: theme('colors.accent.deep'),
              padding: '0.15em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
              fontSize: '0.9em',
              border: `1px solid ${theme('colors.line-soft')}`,
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              backgroundColor: '#0E1014',
              color: '#E5E7EB',
              borderRadius: '0.75rem',
              padding: '1.25rem 1.5rem',
              overflowX: 'auto',
              fontSize: '0.95em',
              lineHeight: '1.6',
              border: 'none',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              fontSize: 'inherit',
              border: 'none',
            },
            img: {
              borderRadius: '0.75rem',
              marginTop: '2em',
              marginBottom: '2em',
            },
            figure: {
              marginTop: '2em',
              marginBottom: '2em',
            },
            figcaption: {
              fontSize: '0.875rem',
              color: theme('colors.ink-mute'),
              textAlign: 'center',
              fontStyle: 'italic',
              marginTop: '0.75em',
            },
            hr: {
              borderColor: theme('colors.line'),
              marginTop: '3em',
              marginBottom: '3em',
            },
            table: {
              fontSize: '0.95em',
              fontFamily: theme('fontFamily.sans').join(', '),
            },
          },
        },
        lg: {
          css: {
            fontSize: '1.1875rem',
            p: { fontSize: '1.1875rem', lineHeight: '1.8' },
            h2: { fontSize: '2rem' },
            h3: { fontSize: '1.5rem' },
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
