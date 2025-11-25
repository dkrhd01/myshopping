"use client";

/**
 * @file lookbook-carousel.tsx
 * @description 자동 슬라이드 룩북 캐러셀 컴포넌트
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { InteractiveLookbook } from "./interactive-lookbook";
import type { Lookbook } from "@/app/actions/lookbooks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LookbookCarouselProps {
  lookbooks: Lookbook[];
}

const AUTO_SLIDE_INTERVAL = 5000; // 5초마다 자동 전환

export function LookbookCarousel({ lookbooks }: LookbookCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  // 자동 슬라이드 (편집 모드일 때는 비활성화)
  useEffect(() => {
    if (isPaused || lookbooks.length <= 1 || isEditMode) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % lookbooks.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, lookbooks.length, isEditMode]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // 편집 모드일 때는 자동 재생하지 않음
    if (!isEditMode) {
      setIsPaused(true);
      // 3초 후 다시 자동 재생
      setTimeout(() => setIsPaused(false), 3000);
    }
  };

  const goToPrevious = () => {
    goToSlide((currentIndex - 1 + lookbooks.length) % lookbooks.length);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % lookbooks.length);
  };

  if (lookbooks.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => !isEditMode && setIsPaused(true)}
      onMouseLeave={() => !isEditMode && setIsPaused(false)}
    >
      {/* 룩북 슬라이드 */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {lookbooks.map((lookbook, index) => (
            <div key={lookbook.id} className="w-full flex-shrink-0">
              <InteractiveLookbook
                lookbookId={lookbook.id}
                title={lookbook.title}
                description={lookbook.description}
                imageUrl={lookbook.image_url}
                products={lookbook.products}
                lookbookIndex={index}
                currentIndex={currentIndex}
                totalCount={lookbooks.length}
                onIndicatorClick={goToSlide}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 네비게이션 버튼 (여러 개일 때만 표시) */}
      {lookbooks.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
            onClick={goToPrevious}
            aria-label="이전 룩북"
          >
            <ChevronLeft className="h-8 w-8 text-white drop-shadow-lg" strokeWidth={2.5} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
            onClick={goToNext}
            aria-label="다음 룩북"
          >
            <ChevronRight className="h-8 w-8 text-white drop-shadow-lg" strokeWidth={2.5} />
          </button>
        </>
      )}
    </div>
  );
}

