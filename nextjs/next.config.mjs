import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Catalyst Serverless Functions base URL
// In production (Catalyst Slate), requests to /server/* must be proxied to the
// Catalyst Functions runtime. Set CATALYST_FUNCTIONS_URL in the Slate env config.
// Locally, Next.js API routes at /api/* handle these requests.
const CATALYST_FUNCTIONS_URL =
  process.env.CATALYST_FUNCTIONS_URL ||
  'https://api.catalyst.zoho.in/baas/v1/project/49149000000019001/function';

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    if (isProd) {
      // Production: /server/{function-name} → Catalyst Function execution endpoint
      return [
        {
          source: '/server/:funcName/:path*',
          destination: `${CATALYST_FUNCTIONS_URL}/:funcName/execute/:path*`,
        },
      ];
    }
    // Local dev: /server/* → /api/* (Next.js API routes simulate the Functions)
    return [
      {
        source: '/server/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
