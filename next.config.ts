import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 나노바나나: /api/generate-image?prompt=... 형태의 로컬 API 라우트 허용
    localPatterns: [
      {
        pathname: '/api/generate-image',
      },
    ],
    // Supabase Storage 이미지 허용 (관리자 업로드 이미지)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vjychsedpcbyocrtrdfd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
