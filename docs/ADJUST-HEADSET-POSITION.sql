-- ============================================
-- 헤드셋 위치를 모델의 오른손으로 조정
-- ============================================

-- 현재 헤드셋 위치 확인
SELECT 
  p.name,
  li.position_x,
  li.position_y
FROM public.lookbook_items li
JOIN public.lookbooks lb ON li.lookbook_id = lb.id
JOIN public.products p ON li.product_id = p.id
WHERE lb.title = '올인원 스타일'
  AND (p.name LIKE '%헤드셋%' OR p.name LIKE '%이어폰%' OR p.slug LIKE '%earbuds%');

-- 헤드셋을 모델의 오른손 위치로 이동
UPDATE public.lookbook_items li
SET position_x = 35, position_y = 50
FROM public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'wireless-earbuds';

-- 조정 후 확인
SELECT 
  p.name,
  li.position_x,
  li.position_y
FROM public.lookbook_items li
JOIN public.lookbooks lb ON li.lookbook_id = lb.id
JOIN public.products p ON li.product_id = p.id
WHERE lb.title = '올인원 스타일'
  AND (p.name LIKE '%헤드셋%' OR p.name LIKE '%이어폰%' OR p.slug LIKE '%earbuds%');

-- ============================================
-- 미세 조정이 필요하면 아래 값을 변경하세요
-- ============================================

-- 더 왼쪽으로
-- UPDATE public.lookbook_items li SET position_x = 30 ...

-- 더 오른쪽으로
-- UPDATE public.lookbook_items li SET position_x = 40 ...

-- 더 위로
-- UPDATE public.lookbook_items li SET position_y = 45 ...

-- 더 아래로
-- UPDATE public.lookbook_items li SET position_y = 55 ...

