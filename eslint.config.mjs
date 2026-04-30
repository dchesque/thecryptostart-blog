import nextConfig from 'eslint-config-next'

const config = [
  {
    ignores: ['.next', 'dist', 'node_modules', 'mcp-server/dist', 'mcp-server/node_modules'],
  },
  ...nextConfig,
  {
    rules: {
      // Pre-existing stylistic, not bugs. Surface as warnings so CI doesn't
      // block legacy content. Replace with proper escapes opportunistically.
      'react/no-unescaped-entities': 'warn',
      // The try/catch-around-data-fetch pattern is intentional in a few
      // server components (CategoryLinks, PopularPosts). React's error
      // boundary linter flags the JSX inside the try, but the JSX is the
      // SUCCESS branch — fetch errors are caught and a fallback is rendered.
      // Treat as warning until we migrate to proper error boundaries.
      'react-hooks/error-boundaries': 'warn',
    },
  },
]

export default config
