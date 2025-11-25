-- ============================================
-- 무선 이어폰 상품 이미지 및 이름 변경 (3.png, 헤드셋)
-- ============================================

UPDATE public.products
SET 
  image_url = '/3.png',
  name = '헤드셋'
WHERE slug = 'wireless-earbuds' 
   OR name LIKE '%무선 이어폰%' 
   OR name LIKE '%이어폰%' 
   OR name LIKE '%이어버드%' 
   OR name LIKE '%에어팟%';

-- 확인 메시지
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE '✅ 무선 이어폰 상품 이미지가 /3.png로 변경되었습니다!';
    RAISE NOTICE '✅ 상품 이름이 "헤드셋"으로 변경되었습니다!';
    RAISE NOTICE '📍 변경된 상품 개수: %', updated_count;
  ELSE
    RAISE NOTICE '⚠️  무선 이어폰 상품을 찾을 수 없습니다.';
    RAISE NOTICE '💡 상품 slug 또는 name을 확인해주세요.';
  END IF;
END $$;

-- 변경 확인 쿼리
SELECT id, name, slug, image_url 
FROM public.products 
WHERE slug = 'wireless-earbuds' 
   OR name LIKE '%무선 이어폰%' 
   OR name LIKE '%이어폰%' 
   OR name LIKE '%이어버드%' 
   OR name LIKE '%에어팟%'
   OR name = '헤드셋';

