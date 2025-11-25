-- ============================================
-- 히어로 룩북 추가 (메인 페이지 최상단)
-- ============================================

-- 1. 히어로 룩북 생성 (display_order = 0으로 가장 먼저 표시)
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '올인원 스타일',
  '일상과 업무를 완벽하게 소화하는 스타일',
  '/lookbooks/hero-look.png',
  0,  -- 가장 먼저 표시
  true
)
ON CONFLICT DO NOTHING;

-- 2. 기존 룩북들의 display_order 조정 (1칸씩 밀기)
UPDATE public.lookbooks 
SET display_order = display_order + 1
WHERE title != '올인원 스타일' AND display_order >= 0;

-- 3. 필요한 상품들이 없으면 추가
INSERT INTO public.products (name, slug, description, price, currency, category, inventory_quantity, is_active, image_url)
VALUES 
  -- 점퍼
  ('프리미엄 패딩 점퍼', 'premium-padding-jacket', '추운 겨울을 따뜻하게 보내는 프리미엄 패딩', 189000, 'KRW', '패션', 30, true, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'),
  -- 후드티
  ('오버핏 후드티', 'oversized-hoodie', '편안한 착용감의 오버핏 후드티', 59000, 'KRW', '패션', 50, true, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'),
  -- 바지
  ('슬림핏 치노 팬츠', 'slim-chino-pants', '어떤 스타일에도 잘 어울리는 치노 팬츠', 69000, 'KRW', '패션', 40, true, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80'),
  -- 신발
  ('클래식 스니커즈', 'classic-sneakers', '데일리로 신기 좋은 클래식 스니커즈', 129000, 'KRW', '패션', 60, true, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80')
ON CONFLICT (slug) DO NOTHING;

-- 4. 상품들을 룩북에 연결
DO $$
DECLARE
  lookbook_hero UUID;
  product_jacket UUID;
  product_hoodie UUID;
  product_headset UUID;
  product_laptop UUID;
  product_pants UUID;
  product_shoes UUID;
BEGIN
  -- 히어로 룩북 ID
  SELECT id INTO lookbook_hero FROM public.lookbooks WHERE title = '올인원 스타일' LIMIT 1;
  
  -- 상품 ID들
  SELECT id INTO product_jacket FROM public.products WHERE slug = 'premium-padding-jacket' LIMIT 1;
  SELECT id INTO product_hoodie FROM public.products WHERE slug = 'oversized-hoodie' LIMIT 1;
  SELECT id INTO product_headset FROM public.products WHERE slug = 'wireless-earbuds' LIMIT 1;  -- 기존 이어폰 사용
  SELECT id INTO product_laptop FROM public.products WHERE slug = 'premium-laptop' LIMIT 1;  -- 기존 노트북 사용
  SELECT id INTO product_pants FROM public.products WHERE slug = 'slim-chino-pants' LIMIT 1;
  SELECT id INTO product_shoes FROM public.products WHERE slug = 'classic-sneakers' LIMIT 1;
  
  -- 룩북이 생성되었는지 확인
  IF lookbook_hero IS NULL THEN
    RAISE NOTICE '⚠️  히어로 룩북이 생성되지 않았습니다.';
    RETURN;
  END IF;
  
  -- 각 상품을 이미지의 위치에 맞게 연결
  -- 점퍼 (상체 중앙)
  IF product_jacket IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_hero, product_jacket, 50, 35)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 점퍼 연결됨';
  END IF;
  
  -- 후드티 (점퍼 안쪽, 상체)
  IF product_hoodie IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_hero, product_hoodie, 50, 40)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 후드티 연결됨';
  END IF;
  
  -- 헤드셋/이어폰 (머리 근처)
  IF product_headset IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_hero, product_headset, 60, 20)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 헤드셋 연결됨';
  END IF;
  
  -- 노트북 (손에 들고 있는 위치)
  IF product_laptop IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_hero, product_laptop, 40, 50)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 노트북 연결됨';
  END IF;
  
  -- 바지 (하체)
  IF product_pants IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_hero, product_pants, 50, 70)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 바지 연결됨';
  END IF;
  
  -- 신발 (하단)
  IF product_shoes IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_hero, product_shoes, 50, 90)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 신발 연결됨';
  END IF;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ 히어로 룩북이 생성되었습니다!';
  RAISE NOTICE '📍 첫 페이지 최상단에 표시됩니다.';
  RAISE NOTICE '====================================';
END $$;

