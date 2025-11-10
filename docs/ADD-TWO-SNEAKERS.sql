-- ============================================
-- 스니커즈 2개 (왼발, 오른발) 추가
-- 같은 상품이지만 위치를 2개로 설정
-- ============================================

-- 1. 기존 스니커즈 항목 확인
SELECT 
  li.id,
  p.name,
  p.slug,
  li.position_x,
  li.position_y
FROM public.lookbook_items li
JOIN public.lookbooks lb ON li.lookbook_id = lb.id
JOIN public.products p ON li.product_id = p.id
WHERE lb.title = '올인원 스타일'
  AND (p.name LIKE '%스니커즈%' OR p.name LIKE '%신발%' OR p.slug LIKE '%sneakers%');

-- 2. 기존 스니커즈 항목 삭제 (중복 방지)
DELETE FROM public.lookbook_items li
USING public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'classic-sneakers';

-- 3. 왼발 스니커즈 추가
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
SELECT 
  lb.id,
  p.id,
  30,  -- 왼쪽 신발 X 좌표 (이미지 기준 왼쪽)
  85   -- 왼쪽 신발 Y 좌표 (하단)
FROM public.lookbooks lb, public.products p
WHERE lb.title = '올인원 스타일'
  AND p.slug = 'classic-sneakers';

-- 4. 오른발 스니커즈 추가
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
SELECT 
  lb.id,
  p.id,
  45,  -- 오른쪽 신발 X 좌표 (이미지 기준 중앙 약간 왼쪽)
  88   -- 오른쪽 신발 Y 좌표 (하단)
FROM public.lookbooks lb, public.products p
WHERE lb.title = '올인원 스타일'
  AND p.slug = 'classic-sneakers';

-- 5. 결과 확인
SELECT 
  li.id,
  p.name,
  li.position_x,
  li.position_y,
  '왼발/오른발' as note
FROM public.lookbook_items li
JOIN public.lookbooks lb ON li.lookbook_id = lb.id
JOIN public.products p ON li.product_id = p.id
WHERE lb.title = '올인원 스타일'
  AND p.slug = 'classic-sneakers'
ORDER BY li.position_x;

-- ============================================
-- 위치 미세 조정이 필요하면:
-- ============================================

-- 왼발 위치 조정
-- UPDATE public.lookbook_items li
-- SET position_x = 28, position_y = 85
-- FROM public.lookbooks lb, public.products p
-- WHERE li.lookbook_id = lb.id 
--   AND li.product_id = p.id
--   AND lb.title = '올인원 스타일'
--   AND p.slug = 'classic-sneakers'
--   AND li.position_x < 40;  -- 왼쪽 것만 선택

-- 오른발 위치 조정
-- UPDATE public.lookbook_items li
-- SET position_x = 47, position_y = 88
-- FROM public.lookbooks lb, public.products p
-- WHERE li.lookbook_id = lb.id 
--   AND li.product_id = p.id
--   AND lb.title = '올인원 스타일'
--   AND p.slug = 'classic-sneakers'
--   AND li.position_x > 40;  -- 오른쪽 것만 선택

