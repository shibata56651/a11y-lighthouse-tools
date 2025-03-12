/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // swcMinify: true,
  env: {
    CHROME_PATH: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  },
  // experimental: {
  //   externalPackages: ["chrome-launcher", "lighthouse"],
  // },
  output: "standalone",
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("lighthouse");
    }
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
