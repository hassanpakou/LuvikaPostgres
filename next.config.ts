// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    turbopackUseSystemTlsCerts: false,
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

// ✅ Applique le plugin next-intl
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);