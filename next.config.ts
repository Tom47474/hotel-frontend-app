import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '**.tencent-cloud.net',
      },
    ],
  },
};

export default nextConfig;
