import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 나노바나나: /api/generate-image?prompt=... 형태의 로컬 API 라우트 허용
    localPatterns: [
      {
        pathname: '/api/generate-image',
      },
    ],
  },
};

export default nextConfig;
