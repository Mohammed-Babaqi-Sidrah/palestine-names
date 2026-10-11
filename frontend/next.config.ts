import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = (process.env.API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
    return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }];
  },
  devIndicators: false,
  // Ensure Three.js and R3F work correctly with Next.js
  transpilePackages: ['three', '@react-three/fiber'],
};

export default nextConfig;
