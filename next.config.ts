import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage 이미지 허용 (나노바나나 + 관리자 업로드 이미지)
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
