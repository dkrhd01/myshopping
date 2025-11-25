-- ============================================
-- 두 번째 룩북 상품 연결 업데이트
-- 기존 상품 연결을 삭제하고 새로운 상품으로 교체
-- ============================================

DO $$
DECLARE
  lookbook_second UUID;
BEGIN
  -- 두 번째 룩북 ID 찾기 (display_order = 1 또는 image_url = '/1111.png')
  SELECT id INTO lookbook_second 
  FROM public.lookbooks 
  WHERE display_order = 1 
     OR image_url = '/1111.png' 
     OR image_url = '/111.png'
  ORDER BY display_order ASC
  LIMIT 1;
  
  IF lookbook_second IS NULL THEN
    RAISE NOTICE '⚠️  두 번째 룩북을 찾을 수 없습니다.';
    RETURN;
  END IF;
  
  RAISE NOTICE '📍 두 번째 룩북 ID: %', lookbook_second;
  
  -- 기존 상품 연결 모두 삭제
  DELETE FROM public.lookbook_items 
  WHERE lookbook_id = lookbook_second;
  
  RAISE NOTICE '✅ 기존 상품 연결이 삭제되었습니다.';
  RAISE NOTICE ' ';
  RAISE NOTICE '📝 아래에 새로운 상품을 연결할 수 있습니다.';
  RAISE NOTICE '💡 예시:';
  RAISE NOTICE '   INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)';
  RAISE NOTICE '   SELECT lookbook_id, product_id, 50, 35';
  RAISE NOTICE '   FROM public.products WHERE slug = ''원하는-상품-slug'';';
  RAISE NOTICE ' ';
  RAISE NOTICE '🎨 영역 설정은 편집 모드(?edit=true)에서 직접 설정할 수 있습니다.';
  
END $$;

-- ============================================
-- 두 번째 룩북에 첫 번째 룩북에 없는 상품들 연결
-- 첫 번째 룩북의 상품들 제외:
-- - premium-padding-jacket
-- - oversized-hoodie
-- - wireless-earbuds
-- - premium-laptop
-- - slim-chino-pants
-- - classic-sneakers
-- ============================================

DO $$
DECLARE
  lookbook_second UUID;
  product_shirt UUID;
  product_shoes UUID;
  product_backpack UUID;
  product_sunglasses UUID;
  product_watch UUID;
  product_airpods UUID;
BEGIN
  -- 두 번째 룩북 ID
  SELECT id INTO lookbook_second 
  FROM public.lookbooks 
  WHERE display_order = 1 
     OR image_url = '/1111.png' 
     OR image_url = '/111.png'
  ORDER BY display_order ASC
  LIMIT 1;
  
  IF lookbook_second IS NULL THEN
    RAISE NOTICE '⚠️  두 번째 룩북을 찾을 수 없습니다.';
    RETURN;
  END IF;
  
  -- 첫 번째 룩북에 없는 다른 상품들 선택
  SELECT id INTO product_shirt FROM public.products WHERE slug = 'modal-cotton-relaxed-shirt' LIMIT 1;
  SELECT id INTO product_shoes FROM public.products WHERE slug = 'nike-air-max-270' LIMIT 1;
  SELECT id INTO product_backpack FROM public.products WHERE slug = 'backpack' LIMIT 1;
  SELECT id INTO product_sunglasses FROM public.products WHERE slug = 'polarized-sunglasses' LIMIT 1;
  SELECT id INTO product_watch FROM public.products WHERE slug = 'samsung-galaxy-watch-7-classic' LIMIT 1;
  SELECT id INTO product_airpods FROM public.products WHERE slug = 'apple-airpods-pro-3rd-gen' LIMIT 1;
  
  -- 셔츠 (상체)
  IF product_shirt IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_shirt, 50, 35)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 셔츠 연결됨';
  END IF;
  
  -- 신발 (하단)
  IF product_shoes IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_shoes, 50, 90)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 신발 연결됨';
  END IF;
  
  -- 가방 (어깨/옆구리)
  IF product_backpack IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_backpack, 30, 50)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 가방 연결됨';
  END IF;
  
  -- 선글라스 (머리)
  IF product_sunglasses IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_sunglasses, 50, 15)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 선글라스 연결됨';
  END IF;
  
  -- 스마트워치 (손목)
  IF product_watch IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_watch, 45, 55)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 스마트워치 연결됨';
  END IF;
  
  -- 에어팟 (머리/귀)
  IF product_airpods IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_second, product_airpods, 55, 20)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✓ 에어팟 연결됨';
  END IF;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ 두 번째 룩북에 새로운 상품들이 연결되었습니다!';
  RAISE NOTICE '📍 첫 번째 룩북과 겹치지 않는 상품들만 사용되었습니다.';
  RAISE NOTICE '====================================';
END $$;


-- 변경 확인 쿼리
SELECT 
  lb.title as lookbook_title,
  lb.image_url,
  p.name as product_name,
  p.slug as product_slug,
  li.position_x,
  li.position_y
FROM public.lookbook_items li
JOIN public.lookbooks lb ON li.lookbook_id = lb.id
JOIN public.products p ON li.product_id = p.id
WHERE lb.display_order = 1 
   OR lb.image_url = '/1111.png'
   OR lb.image_url = '/111.png'
ORDER BY li.position_y, li.position_x;

