-- ============================================
-- 프리미엄 노트북 상품 이미지 변경 (2.png)
-- ============================================

UPDATE public.products
SET image_url = '/2.png'
WHERE slug = 'premium-laptop' OR name LIKE '%프리미엄%노트북%';

-- 확인 메시지
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE '✅ 프리미엄 노트북 이미지가 /2.png로 변경되었습니다!';
    RAISE NOTICE '📍 변경된 상품 개수: %', updated_count;
  ELSE
    RAISE NOTICE '⚠️  프리미엄 노트북 상품을 찾을 수 없습니다.';
    RAISE NOTICE '💡 상품 slug 또는 name을 확인해주세요.';
  END IF;
END $$;

-- 변경 확인 쿼리
SELECT id, name, slug, image_url 
FROM public.products 
WHERE slug = 'premium-laptop' OR name LIKE '%프리미엄%노트북%';

