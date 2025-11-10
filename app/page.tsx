import { Suspense } from "react";
import { getActiveLookbooks } from "@/app/actions/lookbooks";
import { HeroSection } from "@/components/home/hero-section";
import { LookbookCarousel } from "@/components/lookbook/lookbook-carousel";

export default async function Home() {
  const lookbooks = await getActiveLookbooks();

  return (
    <main className="min-h-screen pt-0 max-w-none mx-0 px-0 bg-gradient-to-b from-gray-50 to-white">
      {/* 히어로 섹션 - 브랜드 로고와 검색창 */}
      <HeroSection />

      {/* 룩북 자동 슬라이드 */}
      {lookbooks.length > 0 && (
        <section className="w-full">
          <Suspense fallback={<div className="w-full h-96 flex items-center justify-center">로딩 중...</div>}>
            <LookbookCarousel lookbooks={lookbooks} />
          </Suspense>
        </section>
      )}
    </main>
  );
}
