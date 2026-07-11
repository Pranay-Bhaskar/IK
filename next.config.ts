import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fix: Replaced deprecated 'domains' with 'remotePatterns'
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
};

export default nextConfig;