-- ============================================
-- 스니커즈 상품 이미지 및 이름 변경 (6.png, 세미부츠)
-- ============================================

UPDATE public.products
SET 
  image_url = '/6.png',
  name = '세미부츠'
WHERE slug = 'classic-sneakers' 
   OR slug LIKE '%sneakers%'
   OR slug LIKE '%shoes%'
   OR name LIKE '%스니커%'
   OR name LIKE '%신발%';

-- 확인 메시지
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE '✅ 스니커즈 상품 이미지가 /6.png로 변경되었습니다!';
    RAISE NOTICE '✅ 상품 이름이 "세미부츠"로 변경되었습니다!';
    RAISE NOTICE '📍 변경된 상품 개수: %', updated_count;
  ELSE
    RAISE NOTICE '⚠️  스니커즈 상품을 찾을 수 없습니다.';
    RAISE NOTICE '💡 상품 slug 또는 name을 확인해주세요.';
  END IF;
END $$;

-- 변경 확인 쿼리
SELECT id, name, slug, image_url 
FROM public.products 
WHERE slug = 'classic-sneakers' 
   OR slug LIKE '%sneakers%'
   OR slug LIKE '%shoes%'
   OR name LIKE '%스니커%'
   OR name LIKE '%신발%'
   OR name = '세미부츠';

