-- ============================================
-- 룩북(Lookbook) 테이블 생성
-- 코디 이미지와 연결된 상품들을 관리
-- ============================================

-- 룩북 테이블 (코디 이미지)
CREATE TABLE IF NOT EXISTS public.lookbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 룩북 아이템 테이블 (이미지 내 상품 위치)
CREATE TABLE IF NOT EXISTS public.lookbook_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lookbook_id UUID NOT NULL REFERENCES public.lookbooks(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  -- 이미지 내 위치 (퍼센트 단위: 0-100)
  position_x NUMERIC(5, 2) NOT NULL CHECK (position_x >= 0 AND position_x <= 100),
  position_y NUMERIC(5, 2) NOT NULL CHECK (position_y >= 0 AND position_y <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 권한 설정
ALTER TABLE public.lookbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook_items DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.lookbooks TO anon, authenticated, service_role;
GRANT ALL ON public.lookbook_items TO anon, authenticated, service_role;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_lookbooks_is_active ON public.lookbooks (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_lookbook_items_lookbook_id ON public.lookbook_items (lookbook_id);
CREATE INDEX IF NOT EXISTS idx_lookbook_items_product_id ON public.lookbook_items (product_id);

-- 트리거
DROP TRIGGER IF EXISTS trg_set_lookbooks_updated_at ON public.lookbooks;
CREATE TRIGGER trg_set_lookbooks_updated_at
  BEFORE UPDATE ON public.lookbooks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================
-- 샘플 룩북 데이터 추가
-- ============================================

-- 룩북 1: 겨울 캐주얼 룩
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '겨울 캐주얼 룩',
  '추운 겨울을 따뜻하고 스타일리시하게',
  'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200&q=80',
  1,
  true
) ON CONFLICT (id) DO NOTHING
RETURNING id;

-- 룩북 2: 운동 룩
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '스포티 룩',
  '활동적인 하루를 위한 편안한 스타일',
  'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=1200&q=80',
  2,
  true
) ON CONFLICT (id) DO NOTHING
RETURNING id;

-- ============================================
-- 룩북 아이템 연결 (실제 상품과 매칭)
-- ============================================

-- 겨울 캐주얼 룩에 상품 연결
DO $$
DECLARE
  lookbook_winter UUID;
  product_backpack UUID;
  product_laptop UUID;
  product_earbuds UUID;
BEGIN
  -- 겨울 캐주얼 룩 ID 가져오기
  SELECT id INTO lookbook_winter FROM public.lookbooks WHERE title = '겨울 캐주얼 룩' LIMIT 1;
  
  -- 상품 ID 가져오기
  SELECT id INTO product_backpack FROM public.products WHERE slug = 'backpack' LIMIT 1;
  SELECT id INTO product_laptop FROM public.products WHERE slug = 'premium-laptop' LIMIT 1;
  SELECT id INTO product_earbuds FROM public.products WHERE slug = 'wireless-earbuds' LIMIT 1;
  
  -- 룩북 아이템 추가 (이미지 내 위치 지정)
  IF lookbook_winter IS NOT NULL AND product_backpack IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_winter, product_backpack, 30, 40)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF lookbook_winter IS NOT NULL AND product_laptop IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_winter, product_laptop, 55, 65)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF lookbook_winter IS NOT NULL AND product_earbuds IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_winter, product_earbuds, 70, 30)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 스포티 룩에 상품 연결
DO $$
DECLARE
  lookbook_sport UUID;
  product_shoes UUID;
  product_watch UUID;
  product_yoga UUID;
BEGIN
  -- 스포티 룩 ID 가져오기
  SELECT id INTO lookbook_sport FROM public.lookbooks WHERE title = '스포티 룩' LIMIT 1;
  
  -- 상품 ID 가져오기
  SELECT id INTO product_shoes FROM public.products WHERE slug = 'running-shoes' LIMIT 1;
  SELECT id INTO product_watch FROM public.products WHERE slug = 'smart-watch' LIMIT 1;
  SELECT id INTO product_yoga FROM public.products WHERE slug = 'yoga-mat' LIMIT 1;
  
  -- 룩북 아이템 추가
  IF lookbook_sport IS NOT NULL AND product_shoes IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_sport, product_shoes, 45, 75)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF lookbook_sport IS NOT NULL AND product_watch IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_sport, product_watch, 65, 45)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF lookbook_sport IS NOT NULL AND product_yoga IS NOT NULL THEN
    INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
    VALUES (lookbook_sport, product_yoga, 25, 55)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 룩북 테이블과 샘플 데이터가 생성되었습니다!';
END $$;

