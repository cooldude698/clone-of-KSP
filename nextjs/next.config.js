/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'date-fns'],
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    const CATALYST_FUNCTIONS_URL =
      process.env.CATALYST_FUNCTIONS_URL ||
      'https://drishti-ksp-60073715607.development.catalystserverless.in/server';

    if (isProd) {
      return [
        {
          source: '/server/:funcName/:path*',
          destination: `${CATALYST_FUNCTIONS_URL}/:funcName/execute/:path*`,
        },
      ];
    }
    return [
      {
        source: '/server/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
