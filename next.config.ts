import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },

    ],
  },
  allowedDevOrigins: [
    "pretext-mating-mounting.ngrok-free.dev"
  ],
};

export default nextConfig;
