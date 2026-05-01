import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import withBundleAnalyzer from '@next/bundle-analyzer';
// import withPWA from 'next-pwa';

// Build-time release metadata. Surfaced by /api/version.
function readReleaseMeta() {
  let version = 'unknown';
  try {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
    version = pkg.version || 'unknown';
  } catch {}

  // Allow CI to inject these explicitly (GitHub Actions, EasyPanel build args).
  // Fall back to a local `git rev-parse` if available.
  let gitSha = process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || '';
  let gitBranch = process.env.GIT_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || '';
  if (!gitSha || !gitBranch) {
    try {
      if (!gitSha) gitSha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (!gitBranch) gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {}
  }

  return {
    version,
    gitSha: gitSha || 'unknown',
    gitBranch: gitBranch || 'unknown',
    builtAt: new Date().toISOString(),
  };
}

const release = readReleaseMeta();

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_VERSION: release.version,
    NEXT_PUBLIC_GIT_SHA: release.gitSha,
    NEXT_PUBLIC_GIT_BRANCH: release.gitBranch,
    NEXT_PUBLIC_BUILT_AT: release.builtAt,
  },
  images: {
    // loader: 'custom',
    // loaderFile: './lib/contentful-loader.ts',
    remotePatterns: [
      {
        // Allow any external HTTPS domain (for author avatars from any URL)
        protocol: 'https',
        hostname: '**',
      },
    ],
    // formats: ['image/avif', 'image/webp'], // Handled by Contentful loader (fm=auto)
    deviceSizes: [320, 640, 750, 1080, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
  experimental: {
    optimizeCss: false, // Pode ser ativado com 'critters' se necessário
    serverActions: {
      bodySizeLimit: '10mb', // Permite posts com conteúdo longo (> 4MB padrão)
    },
  },
  turbopack: {}, // Silencia erro do Next.js 16 com plugins Webpack
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.google-analytics.com https://partner.googleadservices.com https://tpc.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https://r2cdn.perplexity.ai; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net; frame-src 'self' https://giscus.app https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
        },
        { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
      ],
    },
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=86400',
        },
      ],
    },
    {
      source: '/:path*.webp',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/:path*.avif',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// const pwa = withPWA({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true,
// });

export default analyzer(nextConfig);
