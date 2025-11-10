-- ============================================
-- 두 번째 코디 룩북 이미지 변경 (111.png -> 1111.png)
-- ============================================

UPDATE public.lookbooks
SET image_url = '/1111.png'
WHERE image_url = '/111.png' 
   OR display_order = 1;

-- 확인 메시지
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE '✅ 두 번째 룩북 이미지가 /1111.png로 변경되었습니다!';
    RAISE NOTICE '📍 변경된 룩북 개수: %', updated_count;
  ELSE
    RAISE NOTICE '⚠️  두 번째 룩북을 찾을 수 없습니다.';
    RAISE NOTICE '💡 이미지 URL 또는 display_order를 확인해주세요.';
  END IF;
END $$;

-- 변경 확인 쿼리
SELECT id, title, image_url, display_order 
FROM public.lookbooks 
WHERE image_url = '/1111.png' 
   OR display_order = 1;








