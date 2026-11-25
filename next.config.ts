import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  devIndicators: false,
  // Painel do Decap CMS (public/admin/index.html).
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
