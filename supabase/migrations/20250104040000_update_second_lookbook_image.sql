-- ============================================
-- 두 번째 코디 룩북 이미지 변경 (11.png -> 111.png)
-- ============================================

UPDATE public.lookbooks
SET image_url = '/111.png'
WHERE image_url = '/11.png';

-- 확인 메시지
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE '✅ 두 번째 룩북 이미지가 /111.png로 변경되었습니다!';
    RAISE NOTICE '📍 변경된 룩북 개수: %', updated_count;
  ELSE
    RAISE NOTICE '⚠️  /11.png 이미지를 사용하는 룩북을 찾을 수 없습니다.';
    RAISE NOTICE '💡 이미지 URL을 확인해주세요.';
  END IF;
END $$;

