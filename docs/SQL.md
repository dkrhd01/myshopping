# Supabase 스키마 개요

Phase 1에 필요한 전자상거래 핵심 테이블(`products`, `cart_items`, `orders`, `order_items`)과 연관 제약 조건을 정리한 문서입니다. 개발 환경에서는 RLS를 비활성화한 상태로 운영하고, Clerk로 동기화된 `users` 테이블(`supabase/migrations/setup_schema.sql`)을 기준으로 참조 관계를 구성합니다.

## 테이블 요약

- **products**: 판매 가능한 상품 정보를 저장합니다. 가격, 재고 수량, 노출 상태 등을 포함합니다.
- **cart_items**: 사용자가 장바구니에 담은 상품과 수량을 저장합니다. 동일 상품 중복 담기를 방지하기 위해 `(user_id, product_id)`를 유니크 처리합니다.
- **orders**: 주문 본문을 저장합니다. 결제 금액, 상태, 배송지 정보, 메모 등을 포함하고 Clerk 사용자와 연결됩니다.
- **order_items**: 주문에 포함된 개별 상품 라인입니다. 주문 시점의 상품명/가격을 스냅샷으로 저장하고 `orders` 및 `products`를 참조합니다.

## DDL 레퍼런스

```sql
-- 전제: public.users(id UUID PRIMARY KEY) 존재

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.products (
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

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id)
);

CREATE TABLE public.orders (
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

CREATE TABLE public.order_items (
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

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_set_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE INDEX idx_products_is_active ON public.products (is_active);
CREATE INDEX idx_products_category ON public.products (category);
CREATE INDEX idx_cart_items_user_id ON public.cart_items (user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items (product_id);
CREATE INDEX idx_orders_user_id ON public.orders (user_id);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_placed_at ON public.orders (placed_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON public.cart_items TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;
```

> 참고: 개발 데이터 삽입은 별도의 시드 파일이나 로컬 스크립트에서 수행합니다. 프로덕션 전환 시에는 각 테이블에 맞는 RLS 정책을 추가로 정의해야 합니다.