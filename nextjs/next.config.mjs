/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '../.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/server/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
