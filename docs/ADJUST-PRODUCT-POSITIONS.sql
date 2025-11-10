-- ============================================
-- 1.png 이미지에 맞게 상품 위치 조정
-- ============================================

-- 현재 연결된 상품들 확인
SELECT 
  p.name as product_name,
  li.position_x,
  li.position_y
FROM public.lookbook_items li
JOIN public.lookbooks lb ON li.lookbook_id = lb.id
JOIN public.products p ON li.product_id = p.id
WHERE lb.title = '올인원 스타일'
ORDER BY li.position_y;

-- ============================================
-- 위치 조정 (이미지를 보면서 미세 조정)
-- ============================================

-- 헤드셋/이어폰 (머리 근처)
UPDATE public.lookbook_items li
SET position_x = 55, position_y = 15
FROM public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'wireless-earbuds';

-- 점퍼 (상체 상단)
UPDATE public.lookbook_items li
SET position_x = 50, position_y = 30
FROM public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'premium-padding-jacket';

-- 후드티 (상체 중간)
UPDATE public.lookbook_items li
SET position_x = 50, position_y = 38
FROM public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'oversized-hoodie';

-- 노트북 (손/중앙)
UPDATE public.lookbook_items li
SET position_x = 35, position_y = 52
FROM public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'premium-laptop';

-- 바지 (하체)
UPDATE public.lookbook_items li
SET position_x = 48, position_y = 68
FROM public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'slim-chino-pants';

-- 신발 (발)
UPDATE public.lookbook_items li
SET position_x = 50, position_y = 88
FROM public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'classic-sneakers';

-- 조정 후 확인
SELECT 
  p.name as product_name,
  li.position_x,
  li.position_y
FROM public.lookbook_items li
JOIN public.lookbooks lb ON li.lookbook_id = lb.id
JOIN public.products p ON li.product_id = p.id
WHERE lb.title = '올인원 스타일'
ORDER BY li.position_y;

