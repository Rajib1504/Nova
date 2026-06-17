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
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      }

    ],
  },
  allowedDevOrigins: [
    "pretext-mating-mounting.ngrok-free.dev"
  ],
};

export default nextConfig;
