import type { NextConfig } from "next";

// Always use basePath for consistent routing
const basePath = "/h5p-viewer";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: basePath,
  assetPrefix: basePath,
  trailingSlash: false,
  // Ensure uploaded files are properly served
  images: {
    unoptimized: true, // Important for contact photos
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Make sure static files are correctly served with the base path
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          }
        ],
      },
    ]
  },
};

export default nextConfig;
