-- ============================================
-- 1.png를 메인 룩북으로 추가 (간단 버전)
-- ============================================

-- 1단계: 히어로 룩북 생성
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '올인원 스타일',
  '일상과 업무를 완벽하게',
  '/lookbooks/hero-look.png',
  0,
  true
);

-- 2단계: 기존 룩북 순서 밀기
UPDATE public.lookbooks 
SET display_order = display_order + 1
WHERE title != '올인원 스타일';

-- 3단계: 새 상품들 추가
INSERT INTO public.products (name, slug, description, price, currency, category, inventory_quantity, is_active, image_url)
VALUES 
  ('패딩 점퍼', 'premium-padding-jacket', '프리미엄 패딩 점퍼', 189000, 'KRW', '패션', 30, true, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'),
  ('후드티', 'oversized-hoodie', '오버핏 후드티', 59000, 'KRW', '패션', 50, true, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'),
  ('치노 팬츠', 'slim-chino-pants', '슬림핏 치노 팬츠', 69000, 'KRW', '패션', 40, true, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'),
  ('스니커즈', 'classic-sneakers', '클래식 스니커즈', 129000, 'KRW', '패션', 60, true, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800')
ON CONFLICT (slug) DO NOTHING;

-- 4단계: 상품 연결 (점퍼)
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
SELECT 
  (SELECT id FROM public.lookbooks WHERE title = '올인원 스타일' LIMIT 1),
  (SELECT id FROM public.products WHERE slug = 'premium-padding-jacket' LIMIT 1),
  50, 35
WHERE EXISTS (SELECT 1 FROM public.lookbooks WHERE title = '올인원 스타일')
  AND EXISTS (SELECT 1 FROM public.products WHERE slug = 'premium-padding-jacket');

-- 5단계: 상품 연결 (후드티)
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
SELECT 
  (SELECT id FROM public.lookbooks WHERE title = '올인원 스타일' LIMIT 1),
  (SELECT id FROM public.products WHERE slug = 'oversized-hoodie' LIMIT 1),
  50, 40
WHERE EXISTS (SELECT 1 FROM public.lookbooks WHERE title = '올인원 스타일')
  AND EXISTS (SELECT 1 FROM public.products WHERE slug = 'oversized-hoodie');

-- 6단계: 상품 연결 (헤드셋/이어폰)
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
SELECT 
  (SELECT id FROM public.lookbooks WHERE title = '올인원 스타일' LIMIT 1),
  (SELECT id FROM public.products WHERE slug = 'wireless-earbuds' LIMIT 1),
  60, 20
WHERE EXISTS (SELECT 1 FROM public.lookbooks WHERE title = '올인원 스타일')
  AND EXISTS (SELECT 1 FROM public.products WHERE slug = 'wireless-earbuds');

-- 7단계: 상품 연결 (노트북)
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
SELECT 
  (SELECT id FROM public.lookbooks WHERE title = '올인원 스타일' LIMIT 1),
  (SELECT id FROM public.products WHERE slug = 'premium-laptop' LIMIT 1),
  40, 50
WHERE EXISTS (SELECT 1 FROM public.lookbooks WHERE title = '올인원 스타일')
  AND EXISTS (SELECT 1 FROM public.products WHERE slug = 'premium-laptop');

-- 8단계: 상품 연결 (바지)
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
SELECT 
  (SELECT id FROM public.lookbooks WHERE title = '올인원 스타일' LIMIT 1),
  (SELECT id FROM public.products WHERE slug = 'slim-chino-pants' LIMIT 1),
  50, 70
WHERE EXISTS (SELECT 1 FROM public.lookbooks WHERE title = '올인원 스타일')
  AND EXISTS (SELECT 1 FROM public.products WHERE slug = 'slim-chino-pants');

-- 9단계: 상품 연결 (신발)
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
SELECT 
  (SELECT id FROM public.lookbooks WHERE title = '올인원 스타일' LIMIT 1),
  (SELECT id FROM public.products WHERE slug = 'classic-sneakers' LIMIT 1),
  50, 90
WHERE EXISTS (SELECT 1 FROM public.lookbooks WHERE title = '올인원 스타일')
  AND EXISTS (SELECT 1 FROM public.products WHERE slug = 'classic-sneakers');

-- 완료 확인
SELECT '✅ 히어로 룩북이 생성되었습니다!' as message;

