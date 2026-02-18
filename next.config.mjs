/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: false,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  output: 'standalone',
  headers: async () => [{
    source: '/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      // Strict-Transport-Security: enforce HTTPS for 2 years
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      // Referrer-Policy: only send origin on cross-origin requests
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Permissions-Policy: disable unused browser features
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      // Content-Security-Policy
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          // Scripts: own origin + inline (Next.js requires) + GA4 + AdSense
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com",
          // Styles: own origin + inline (Tailwind/Next.js requires)
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          // Fonts
          "font-src 'self' https://fonts.gstatic.com",
          // Images: own origin + data URIs + Contentful CDN + Google
          "img-src 'self' data: https://images.ctfassets.net https://www.google-analytics.com https://www.googletagmanager.com",
          // API connections: own origin + Google Analytics
          "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
          // Frames: Google AdSense only
          "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
          // Block all other object/embed
          "object-src 'none'",
          // Base URI restricted to own origin
          "base-uri 'self'",
          // Forms restricted to own origin
          "form-action 'self'",
        ].join('; '),
      },
    ],
  }],
}

export default nextConfig
