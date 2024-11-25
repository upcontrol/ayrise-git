import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};

export default nextConfig;



module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb'
    }
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      //config.plugins.push(new MiniCssExtractPlugin());
    }
    return config;
  },
};