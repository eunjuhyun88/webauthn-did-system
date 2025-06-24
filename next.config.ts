/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 빌드 시 ESLint 오류 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript 오류도 무시 (개발 단계)
    ignoreBuildErrors: true,
  }
};

export default nextConfig;