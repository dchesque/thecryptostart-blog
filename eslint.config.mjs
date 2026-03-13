import nextConfig from 'eslint-config-next'

export default [
  {
    ignores: ['.next', 'dist', 'node_modules'],
  },
  ...nextConfig,
]
