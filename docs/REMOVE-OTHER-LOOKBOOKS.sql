-- ============================================
-- 1.png (올인원 스타일)만 남기고 다른 룩북 제거
-- ============================================

-- 방법 1: 비활성화 (데이터는 보관)
UPDATE public.lookbooks 
SET is_active = false
WHERE title != '올인원 스타일';

-- 또는

-- 방법 2: 완전 삭제
DELETE FROM public.lookbooks 
WHERE title != '올인원 스타일';

-- 확인
SELECT id, title, is_active, display_order 
FROM public.lookbooks 
ORDER BY display_order;

