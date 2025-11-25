-- 두 번째 룩북을 위한 새로운 상품 추가 (선글라스, 옷, 신발)

-- 1. 선글라스 상품 추가
INSERT INTO products (
  name,
  slug,
  description,
  price,
  currency,
  stock,
  category,
  image_url,
  created_at
) VALUES (
  '레이밴 웨이페어러 선글라스',
  'rayban-wayfarer-sunglasses',
  '클래식한 디자인의 레이밴 웨이페어러 선글라스입니다. UV 차단 기능과 편안한 착용감을 제공합니다.',
  189000,
  'KRW',
  30,
  'accessories',
  '/10.png',
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url;

-- 2. 옷 상품 추가 (가디건)
INSERT INTO products (
  name,
  slug,
  description,
  price,
  currency,
  stock,
  category,
  image_url,
  created_at
) VALUES (
  '울 블렌드 니트 가디건',
  'wool-blend-knit-cardigan',
  '부드러운 울 혼방 소재의 니트 가디건입니다. 따뜻하면서도 세련된 스타일을 연출할 수 있습니다.',
  159000,
  'KRW',
  25,
  'fashion',
  '/9.png',
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url;

-- 3. 신발 상품 추가 (로퍼)
INSERT INTO products (
  name,
  slug,
  description,
  price,
  currency,
  stock,
  category,
  image_url,
  created_at
) VALUES (
  '프리미엄 레더 로퍼',
  'premium-leather-loafers',
  '고급 천연 가죽으로 제작된 로퍼입니다. 편안한 착용감과 우아한 디자인을 자랑합니다.',
  229000,
  'KRW',
  20,
  'fashion',
  '/8.png',
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url;

-- 두 번째 룩북 찾기 및 기존 아이템 삭제
DO $$
DECLARE
  second_lookbook_id UUID;
  sunglasses_id UUID;
  cardigan_id UUID;
  loafers_id UUID;
BEGIN
  -- 두 번째 룩북 ID 찾기
  SELECT id INTO second_lookbook_id
  FROM lookbooks
  WHERE image_url = '/1111.png' OR display_order = 1
  LIMIT 1;

  -- 새 상품들의 ID 찾기
  SELECT id INTO sunglasses_id FROM products WHERE slug = 'rayban-wayfarer-sunglasses';
  SELECT id INTO cardigan_id FROM products WHERE slug = 'wool-blend-knit-cardigan';
  SELECT id INTO loafers_id FROM products WHERE slug = 'premium-leather-loafers';

  IF second_lookbook_id IS NOT NULL AND sunglasses_id IS NOT NULL AND cardigan_id IS NOT NULL AND loafers_id IS NOT NULL THEN
    -- 기존 두 번째 룩북의 모든 아이템 삭제
    DELETE FROM lookbook_items WHERE lookbook_id = second_lookbook_id;

    -- 새로운 3가지 상품 추가
    -- 1. 선글라스 (화면 상단 중앙)
    INSERT INTO lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (second_lookbook_id, sunglasses_id, 50, 25);

    -- 2. 가디건 (화면 중앙)
    INSERT INTO lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (second_lookbook_id, cardigan_id, 50, 50);

    -- 3. 로퍼 (화면 하단)
    INSERT INTO lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (second_lookbook_id, loafers_id, 50, 75);

    RAISE NOTICE '두 번째 룩북에 새로운 3가지 상품이 추가되었습니다.';
  ELSE
    RAISE NOTICE '룩북 또는 상품을 찾을 수 없습니다.';
  END IF;
END $$;

