# 데이터베이스 테이블 생성 가이드

## 문제: "Could not find the table 'public.cart_items' in the schema cache"

이 오류는 필요한 테이블들이 Supabase에 생성되지 않았음을 의미합니다.

## 🚀 빠른 해결 방법

### 방법 1: Supabase Dashboard에서 SQL 실행 (가장 빠름)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 버튼 클릭

3. **아래 SQL 전체 복사하여 실행**

```sql
-- ============================================
-- 필수 테이블 생성 스크립트
-- ============================================

-- pgcrypto 확장 활성화 (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. Users 테이블 (Clerk 사용자 정보)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Users 테이블 권한 설정
ALTER TABLE public.users OWNER TO postgres;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- ============================================
-- 2. Products 테이블 (상품 정보)
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'KRW',
  category TEXT,
  inventory_quantity INTEGER NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products 테이블 권한 설정
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.products TO anon, authenticated, service_role;

-- ============================================
-- 3. Cart Items 테이블 (장바구니)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id)
);

-- Cart Items 테이블 권한 설정
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.cart_items TO anon, authenticated, service_role;

-- ============================================
-- 4. Orders 테이블 (주문 정보)
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'KRW',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'fulfilled', 'shipped', 'cancelled', 'refunded')),
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_postal_code TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_country TEXT,
  order_note TEXT,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders 테이블 권한 설정
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.orders TO anon, authenticated, service_role;

-- ============================================
-- 5. Order Items 테이블 (주문 상세)
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items 테이블 권한 설정
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;

-- ============================================
-- 트리거: updated_at 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Products 트리거
DROP TRIGGER IF EXISTS trg_set_products_updated_at ON public.products;
CREATE TRIGGER trg_set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Cart Items 트리거
DROP TRIGGER IF EXISTS trg_set_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_set_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Orders 트리거
DROP TRIGGER IF EXISTS trg_set_orders_updated_at ON public.orders;
CREATE TRIGGER trg_set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON public.orders (placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✓ 모든 테이블이 성공적으로 생성되었습니다!';
  RAISE NOTICE '✓ 다음 단계: 샘플 상품 데이터를 추가하세요.';
END $$;
```

4. **"Run" 버튼 클릭하여 실행**

5. **결과 확인**
   - 성공 메시지가 표시되면 완료
   - 에러가 있으면 에러 메시지를 확인하고 다시 실행

### 방법 2: 샘플 상품 데이터 추가

테이블 생성 후 샘플 상품을 추가하려면:

```sql
-- 샘플 상품 20개 추가
INSERT INTO public.products (name, slug, description, price, currency, category, inventory_quantity, is_active)
VALUES
  ('프리미엄 노트북', 'premium-laptop', '고성능 프로세서와 대용량 메모리를 갖춘 프리미엄 노트북', 1500000, 'KRW', '전자기기', 50, true),
  ('무선 이어폰', 'wireless-earbuds', '노이즈 캔슬링 기능이 있는 무선 이어폰', 150000, 'KRW', '전자기기', 200, true),
  ('스마트 워치', 'smart-watch', '건강 추적 및 알림 기능이 있는 스마트 워치', 300000, 'KRW', '전자기기', 100, true),
  ('백팩', 'backpack', '방수 기능이 있는 여행용 백팩', 80000, 'KRW', '패션', 150, true),
  ('러닝화', 'running-shoes', '쿠션감이 뛰어난 러닝화', 120000, 'KRW', '스포츠', 75, true),
  ('커피 메이커', 'coffee-maker', '원터치로 에스프레소를 만들 수 있는 커피 메이커', 250000, 'KRW', '가전', 30, true),
  ('요가 매트', 'yoga-mat', '친환경 소재의 미끄럼 방지 요가 매트', 45000, 'KRW', '스포츠', 200, true),
  ('블루투스 스피커', 'bluetooth-speaker', '휴대용 방수 블루투스 스피커', 95000, 'KRW', '전자기기', 120, true),
  ('전기 주전자', 'electric-kettle', '빠른 가열 기능이 있는 전기 주전자', 35000, 'KRW', '가전', 180, true),
  ('책상 램프', 'desk-lamp', 'LED 조명과 밝기 조절 기능이 있는 책상 램프', 55000, 'KRW', '가구', 90, true),
  ('마우스', 'ergonomic-mouse', '인체공학적 디자인의 무선 마우스', 40000, 'KRW', '전자기기', 250, true),
  ('키보드', 'mechanical-keyboard', '기계식 키보드 (청축)', 130000, 'KRW', '전자기기', 60, true),
  ('선글라스', 'polarized-sunglasses', 'UV 차단 편광 선글라스', 85000, 'KRW', '패션', 110, true),
  ('수건 세트', 'towel-set', '면 100% 수건 세트 (3종)', 42000, 'KRW', '생활용품', 140, true),
  ('보조 배터리', 'power-bank', '20000mAh 고속 충전 보조 배터리', 48000, 'KRW', '전자기기', 180, true),
  ('텀블러', 'stainless-tumbler', '보온/보냉 스테인리스 텀블러', 28000, 'KRW', '생활용품', 300, true),
  ('실내화', 'indoor-slippers', '편안한 메모리폼 실내화', 22000, 'KRW', '패션', 220, true),
  ('책장', 'bookshelf', '5단 원목 책장', 180000, 'KRW', '가구', 25, true),
  ('식탁 의자', 'dining-chair', '쿠션 패브릭 식탁 의자', 95000, 'KRW', '가구', 50, true),
  ('공기청정기', 'air-purifier', 'HEPA 필터 탑재 공기청정기', 320000, 'KRW', '가전', 40, true)
ON CONFLICT (slug) DO NOTHING;
```

### 방법 3: 터미널에서 마이그레이션 실행 (로컬 개발)

```bash
# Supabase CLI 설치 확인
npx supabase --version

# 로컬 데이터베이스 리셋 및 마이그레이션 실행
npx supabase db reset

# 또는 마이그레이션만 실행
npx supabase db push
```

## ✅ 테이블 생성 확인

SQL Editor에서 다음 쿼리로 테이블이 정상 생성되었는지 확인:

```sql
-- 모든 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 각 테이블의 레코드 수 확인
SELECT 
  (SELECT COUNT(*) FROM public.users) as users_count,
  (SELECT COUNT(*) FROM public.products) as products_count,
  (SELECT COUNT(*) FROM public.cart_items) as cart_items_count,
  (SELECT COUNT(*) FROM public.orders) as orders_count,
  (SELECT COUNT(*) FROM public.order_items) as order_items_count;
```

예상 결과:
```
users          ✓
products       ✓
cart_items     ✓
orders         ✓
order_items    ✓
```

## 🔄 이후 단계

1. **페이지 새로고침** (F5)
2. **사용자 동기화 확인**
   - `/debug/cart` 페이지 방문
   - "사용자 동기화" 버튼 클릭
3. **장바구니 추가 재시도**

## 💡 문제가 계속되면

1. Supabase Dashboard의 "Logs" 탭 확인
2. 브라우저 콘솔 (F12) 확인
3. 서버 터미널 로그 확인

## ⚠️ 주의사항

- **개발 환경**: RLS가 비활성화되어 있어 누구나 데이터에 접근 가능
- **프로덕션 배포 전**: 적절한 RLS 정책을 추가해야 합니다
- **백업**: 중요한 데이터가 있다면 테이블 생성 전 백업하세요

