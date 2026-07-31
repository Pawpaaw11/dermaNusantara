import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Saat development/local production, gambar upload berasal dari BE lokal.
    // Lewati optimizer Next agar URL localhost:3000 dapat dirender langsung.
    unoptimized: (process.env.API_BASE_URL ?? "").includes("localhost"),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/aida-public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3000", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
