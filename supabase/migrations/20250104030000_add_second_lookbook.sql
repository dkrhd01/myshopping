-- ============================================
-- 두 번째 코디 룩북 추가 (11.png 이미지)
-- ============================================

-- 1. 두 번째 룩북 생성
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  'BEST CODY',
  '두 번째 스타일 코디',
  '/111.png',
  1,  -- 첫 번째 코디 다음에 표시
  true
)
ON CONFLICT DO NOTHING;

-- 2. 기존 룩북들의 display_order 조정 (2 이상인 것들만 1칸씩 밀기)
UPDATE public.lookbooks 
SET display_order = display_order + 1
WHERE display_order >= 1 AND title != 'BEST CODY';

-- 3. 상품들을 두 번째 룩북에 연결 (기존 상품들 재사용)
DO $$
DECLARE
  lookbook_second UUID;
  product_jacket UUID;
  product_hoodie UUID;
  product_headset UUID;
  product_laptop UUID;
  product_pants UUID;
  product_shoes UUID;
BEGIN
  -- 두 번째 룩북 ID
  SELECT id INTO lookbook_second FROM public.lookbooks WHERE image_url = '/111.png' LIMIT 1;
  
  -- 상품 ID들 (기존 상품 재사용)
  SELECT id INTO product_jacket FROM public.products WHERE slug = 'premium-padding-jacket' LIMIT 1;
  SELECT id INTO product_hoodie FROM public.products WHERE slug = 'oversized-hoodie' LIMIT 1;
  SELECT id INTO product_headset FROM public.products WHERE slug = 'wireless-earbuds' LIMIT 1;
  SELECT id INTO product_laptop FROM public.products WHERE slug = 'premium-laptop' LIMIT 1;
  SELECT id INTO product_pants FROM public.products WHERE slug = 'slim-chino-pants' LIMIT 1;
  SELECT id INTO product_shoes FROM public.products WHERE slug = 'classic-sneakers' LIMIT 1;
  
  -- 룩북이 생성되었는지 확인
  IF lookbook_second IS NULL THEN
    RAISE NOTICE '⚠️  두 번째 룩북이 생성되지 않았습니다.';
    RETURN;
  END IF;
  
  -- 각 상품을 이미지의 위치에 맞게 연결 (11.png 이미지에 맞게 조정 필요)
  -- 점퍼 (상체 중앙)
  IF product_jacket IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_jacket, 50, 35)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 점퍼 연결됨';
  END IF;
  
  -- 후드티 (점퍼 안쪽, 상체)
  IF product_hoodie IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_hoodie, 50, 40)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 후드티 연결됨';
  END IF;
  
  -- 헤드셋/이어폰 (머리 근처)
  IF product_headset IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_headset, 60, 20)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 헤드셋 연결됨';
  END IF;
  
  -- 노트북 (손에 들고 있는 위치)
  IF product_laptop IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_laptop, 40, 50)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 노트북 연결됨';
  END IF;
  
  -- 바지 (하체)
  IF product_pants IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_pants, 50, 70)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 바지 연결됨';
  END IF;
  
  -- 신발 (하단)
  IF product_shoes IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_shoes, 50, 90)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 신발 연결됨';
  END IF;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ 두 번째 룩북이 생성되었습니다!';
  RAISE NOTICE '📍 슬라이드로 오른쪽으로 넘어가며 표시됩니다.';
  RAISE NOTICE '====================================';
END $$;

