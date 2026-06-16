import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co'

      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      }

    ],
  },
  allowedDevOrigins: [
    "pretext-mating-mounting.ngrok-free.dev"
  ],
};

export default nextConfig;
