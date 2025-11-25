-- ============================================
-- 패딩점퍼 상품 이미지 변경 (4.png)
-- ============================================

UPDATE public.products
SET image_url = '/4.png'
WHERE slug = 'premium-padding-jacket' 
   OR name LIKE '%패딩%점퍼%' 
   OR name LIKE '%점퍼%' 
   OR name LIKE '%재킷%'
   OR slug LIKE '%jacket%'
   OR slug LIKE '%padding%';

-- 확인 메시지
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE '✅ 패딩점퍼 상품 이미지가 /4.png로 변경되었습니다!';
    RAISE NOTICE '📍 변경된 상품 개수: %', updated_count;
  ELSE
    RAISE NOTICE '⚠️  패딩점퍼 상품을 찾을 수 없습니다.';
    RAISE NOTICE '💡 상품 slug 또는 name을 확인해주세요.';
  END IF;
END $$;

-- 변경 확인 쿼리
SELECT id, name, slug, image_url 
FROM public.products 
WHERE slug = 'premium-padding-jacket' 
   OR name LIKE '%패딩%점퍼%' 
   OR name LIKE '%점퍼%' 
   OR name LIKE '%재킷%'
   OR slug LIKE '%jacket%'
   OR slug LIKE '%padding%';

