// next.config.js - 간단하게 수정
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 불필요한 옵션들 제거
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: false,
        assert: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig