import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone/LAN + tunnel origins to /_next (HMR + chunks) in development
  allowedDevOrigins: [
    "192.168.1.6",
    "26.124.247.78",
    "192.168.56.1",
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
};

export default nextConfig;
