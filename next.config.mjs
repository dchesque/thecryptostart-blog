/** @type {import('next').NextConfig} */
// NOTA: output: 'standalone' foi removido pois causa conflito com Turbopack no dev.
// Para build de produção/Docker, adicione novamente via variável de ambiente ou Dockerfile.
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['images.ctfassets.net'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: false,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  headers: async () => [{
    source: '/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
    ],
  }],
}

export default nextConfig
