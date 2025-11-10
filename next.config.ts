import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "images.unsplash.com" }, // Unsplash 이미지 허용
    ],
  },
  // 개발 도구 포털 요소 관련 경고 억제
  reactStrictMode: true,
  experimental: {
    // 개발 모드에서 불필요한 경고 제거
    optimizePackageImports: ["@clerk/nextjs", "@supabase/supabase-js"],
  },
  // 편집기 링크는 NEXT_EDITOR_URL 환경 변수로 설정됨
  // .env.local에 NEXT_EDITOR_URL=vscode://file/{path}:{line}:{column} 추가됨
};

export default nextConfig;
