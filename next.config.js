/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ttf$/i,
      type: "asset/resource",
    });
    return config;
  },
};

module.exports = nextConfig;
