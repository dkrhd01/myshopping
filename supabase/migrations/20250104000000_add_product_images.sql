-- ============================================
-- 상품 이미지 URL 컬럼 추가
-- ============================================
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================
-- 기존 상품에 Unsplash 고품질 이미지 할당
-- ============================================

-- 전자기기
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80' WHERE slug = 'premium-laptop';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80' WHERE slug = 'wireless-earbuds';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80' WHERE slug = 'smart-watch';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80' WHERE slug = 'ergonomic-mouse';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80' WHERE slug = 'mechanical-keyboard';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80' WHERE slug = 'bluetooth-speaker';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80' WHERE slug = 'power-bank';

-- 패션
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' WHERE slug = 'backpack';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80' WHERE slug = 'polarized-sunglasses';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80' WHERE slug = 'indoor-slippers';

-- 스포츠
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' WHERE slug = 'running-shoes';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80' WHERE slug = 'yoga-mat';

-- 가전
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80' WHERE slug = 'coffee-maker';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1564994461124-c800e048dd83?w=800&q=80' WHERE slug = 'electric-kettle';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80' WHERE slug = 'air-purifier';

-- 가구
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80' WHERE slug = 'desk-lamp';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80' WHERE slug = 'bookshelf';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80' WHERE slug = 'dining-chair';

-- 생활용품
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80' WHERE slug = 'towel-set';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80' WHERE slug = 'stainless-tumbler';

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 상품 이미지 컬럼이 추가되고 모든 상품에 이미지가 할당되었습니다!';
END $$;

