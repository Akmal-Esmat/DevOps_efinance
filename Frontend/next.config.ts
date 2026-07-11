import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";
    return [
      { source: "/api/chat", destination: `${backend}/chat` },
      { source: "/api/models", destination: `${backend}/models` },
    ];
  },
};

export default nextConfig;