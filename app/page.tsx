import { Suspense } from "react";
import { getActiveLookbooks } from "@/app/actions/lookbooks";
import { HeroSection } from "@/components/home/hero-section";
import { LookbookCarousel } from "@/components/lookbook/lookbook-carousel";

// 동적 렌더링으로 설정하여 매 요청마다 최신 데이터 가져오기
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const lookbooks = await getActiveLookbooks();

  // 디버깅을 위한 로그 (프로덕션에서도 확인 가능)
  console.log("[HomePage] Lookbooks count:", lookbooks.length);
  if (lookbooks.length > 0) {
    console.log("[HomePage] First lookbook:", {
      id: lookbooks[0].id,
      title: lookbooks[0].title,
      productsCount: lookbooks[0].products.length,
    });
  }

  return (
    <main className="min-h-screen pt-0 max-w-none mx-0 px-0 bg-gradient-to-b from-gray-50 to-white">
      {/* 히어로 섹션 - 브랜드 로고와 검색창 */}
      <HeroSection />

      {/* 룩북 자동 슬라이드 */}
      {lookbooks.length > 0 ? (
        <section className="w-full">
          <Suspense fallback={<div className="w-full h-96 flex items-center justify-center">로딩 중...</div>}>
            <LookbookCarousel lookbooks={lookbooks} />
          </Suspense>
        </section>
      ) : (
        <section className="w-full py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              룩북 데이터를 불러오는 중입니다...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              데이터가 보이지 않으면 관리자 페이지에서 룩북을 생성해주세요.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
