import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: "/h5p-viewer",
  assetPrefix: "/h5p-viewer",
  trailingSlash: false,
};

export default nextConfig;
