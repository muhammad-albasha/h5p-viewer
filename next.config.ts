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
};

export default nextConfig;
