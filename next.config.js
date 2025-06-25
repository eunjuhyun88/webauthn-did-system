/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ngrok 환경 최적화
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001', 
        '*.ngrok-free.app',
        '*.ngrok.io',
        '3c8e-125-142-232-68.ngrok-free.app'
      ]
    }
  },
  
  // HTTPS 및 CORS 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          }
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Ngrok 호환성
  poweredByHeader: false,
  compress: true,
  
  // 개발 환경 설정
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: false,
  })
};

module.exports = nextConfig;
