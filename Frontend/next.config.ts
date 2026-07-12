import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      { source: "/api/chat", destination: "http://backend:8000/chat" },
      { source: "/api/models", destination: "http://backend:8000/models" },
    ];
  },
};

export default nextConfig;