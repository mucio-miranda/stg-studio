import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  devIndicators: false,
  // Painel de conteúdo: Pages CMS (configurado em .pages.yml).
  async redirects() {
    return [{ source: "/admin", destination: "https://app.pagescms.org/", permanent: false }];
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
