# 🚀 룩북 기능 즉시 적용하기

## 1단계: SQL 실행

### Supabase Dashboard 접속
1. https://supabase.com/dashboard
2. 프로젝트 선택
3. **SQL Editor** 클릭

### SQL 복사 & 실행

아래 전체 SQL을 복사하여 실행하세요:

```sql
-- ============================================
-- 룩북(Lookbook) 테이블 생성
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
  position_x NUMERIC(5, 2) NOT NULL CHECK (position_x >= 0 AND position_x <= 100),
  position_y NUMERIC(5, 2) NOT NULL CHECK (position_y >= 0 AND position_y <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 권한 설정
ALTER TABLE public.lookbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook_items DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.lookbooks TO anon, authenticated, service_role;
GRANT ALL ON public.lookbook_items TO anon, authenticated, service_role;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_lookbooks_is_active ON public.lookbooks (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_lookbook_items_lookbook_id ON public.lookbook_items (lookbook_id);

-- 트리거
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_lookbooks_updated_at ON public.lookbooks;
CREATE TRIGGER trg_set_lookbooks_updated_at
  BEFORE UPDATE ON public.lookbooks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================
-- 샘플 룩북 데이터
-- ============================================

-- 룩북 1: 겨울 캐주얼
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '겨울 캐주얼 룩',
  '추운 겨울을 따뜻하고 스타일리시하게',
  'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200&q=80',
  1,
  true
);

-- 룩북 2: 스포티
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '스포티 룩',
  '활동적인 하루를 위한 편안한 스타일',
  'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=1200&q=80',
  2,
  true
);

-- 상품 연결
DO $$
DECLARE
  lookbook_winter UUID;
  lookbook_sport UUID;
  product_backpack UUID;
  product_laptop UUID;
  product_earbuds UUID;
  product_shoes UUID;
  product_watch UUID;
  product_yoga UUID;
BEGIN
  -- 룩북 ID
  SELECT id INTO lookbook_winter FROM public.lookbooks WHERE title = '겨울 캐주얼 룩' LIMIT 1;
  SELECT id INTO lookbook_sport FROM public.lookbooks WHERE title = '스포티 룩' LIMIT 1;
  
  -- 상품 ID
  SELECT id INTO product_backpack FROM public.products WHERE slug = 'backpack' LIMIT 1;
  SELECT id INTO product_laptop FROM public.products WHERE slug = 'premium-laptop' LIMIT 1;
  SELECT id INTO product_earbuds FROM public.products WHERE slug = 'wireless-earbuds' LIMIT 1;
  SELECT id INTO product_shoes FROM public.products WHERE slug = 'running-shoes' LIMIT 1;
  SELECT id INTO product_watch FROM public.products WHERE slug = 'smart-watch' LIMIT 1;
  SELECT id INTO product_yoga FROM public.products WHERE slug = 'yoga-mat' LIMIT 1;
  
  -- 겨울 룩 연결
  IF lookbook_winter IS NOT NULL THEN
    IF product_backpack IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_winter, product_backpack, 30, 40);
    END IF;
    
    IF product_laptop IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_winter, product_laptop, 55, 65);
    END IF;
    
    IF product_earbuds IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_winter, product_earbuds, 70, 30);
    END IF;
  END IF;
  
  -- 스포티 룩 연결
  IF lookbook_sport IS NOT NULL THEN
    IF product_shoes IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_sport, product_shoes, 45, 75);
    END IF;
    
    IF product_watch IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_sport, product_watch, 65, 45);
    END IF;
    
    IF product_yoga IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_sport, product_yoga, 25, 55);
    END IF;
  END IF;
END $$;
```

---

## 2단계: 개발 서버 재시작

터미널에서:

```bash
# Ctrl+C로 서버 중지 후
pnpm dev
```

---

## 3단계: 확인하기

브라우저에서:
- **http://localhost:3000** 접속
- 홈페이지 상단에 "**스타일 추천**" 섹션 확인
- 이미지 위의 `+` 아이콘에 마우스 올려보기
- 클릭하여 상품 페이지로 이동

---

## ✅ 체크리스트

- [ ] Supabase SQL Editor에서 위 SQL 실행
- [ ] 에러 없이 완료 확인
- [ ] `pnpm dev` 재시작
- [ ] 홈페이지에서 룩북 확인
- [ ] 호버 시 상품 카드 나타남
- [ ] 클릭 시 상품 페이지 이동

---

## 🎉 완료!

첨부하신 이미지처럼 인터랙티브한 룩북 기능이 작동합니다!

### 작동 방식
1. 코디 이미지 위에 `+` 펄스 아이콘
2. 마우스 호버 → 상품 정보 카드 표시
3. 클릭 → 상품 상세 페이지
4. 하단에 포함 상품 목록

---

## 📚 추가 가이드

더 자세한 사용법은:
- `docs/LOOKBOOK-GUIDE.md` 참고
- 새 룩북 추가 방법
- 커스터마이징 가이드
- 문제 해결 방법

