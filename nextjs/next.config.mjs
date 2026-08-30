import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Catalyst Serverless Functions base URL
const CATALYST_FUNCTIONS_URL =
  process.env.CATALYST_FUNCTIONS_URL ||
  'https://api.catalyst.zoho.in/baas/v1/project/49149000000019001/function';

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  compress: true,
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

export default nextConfig;
