# 🎯 1.png를 메인 룩북으로 적용하기

## ✅ 완료된 작업

1. ✅ `1.png` → `public/lookbooks/hero-look.png`로 복사
2. ✅ SQL 마이그레이션 파일 생성
3. ✅ 6개 상품 추가 준비 (점퍼, 후드티, 헤드셋, 노트북, 바지, 신발)

---

## 🚀 즉시 적용하기

### 1단계: Supabase SQL 실행

**Supabase Dashboard → SQL Editor**에서 아래 SQL 실행:

```sql
-- ============================================
-- 히어로 룩북 추가 (메인 페이지 최상단)
-- ============================================

-- 1. 히어로 룩북 생성
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '올인원 스타일',
  '일상과 업무를 완벽하게 소화하는 스타일',
  '/lookbooks/hero-look.png',
  0,
  true
)
ON CONFLICT DO NOTHING;

-- 2. 기존 룩북 순서 조정
UPDATE public.lookbooks 
SET display_order = display_order + 1
WHERE title != '올인원 스타일' AND display_order >= 0;

-- 3. 새 상품 추가
INSERT INTO public.products (name, slug, description, price, currency, category, inventory_quantity, is_active, image_url)
VALUES 
  ('프리미엄 패딩 점퍼', 'premium-padding-jacket', '추운 겨울을 따뜻하게 보내는 프리미엄 패딩', 189000, 'KRW', '패션', 30, true, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'),
  ('오버핏 후드티', 'oversized-hoodie', '편안한 착용감의 오버핏 후드티', 59000, 'KRW', '패션', 50, true, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'),
  ('슬림핏 치노 팬츠', 'slim-chino-pants', '어떤 스타일에도 잘 어울리는 치노 팬츠', 69000, 'KRW', '패션', 40, true, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80'),
  ('클래식 스니커즈', 'classic-sneakers', '데일리로 신기 좋은 클래식 스니커즈', 129000, 'KRW', '패션', 60, true, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80')
ON CONFLICT (slug) DO NOTHING;

-- 4. 상품 연결
DO $$
DECLARE
  lookbook_hero UUID;
  product_jacket UUID;
  product_hoodie UUID;
  product_headset UUID;
  product_laptop UUID;
  product_pants UUID;
  product_shoes UUID;
BEGIN
  SELECT id INTO lookbook_hero FROM public.lookbooks WHERE title = '올인원 스타일' LIMIT 1;
  
  SELECT id INTO product_jacket FROM public.products WHERE slug = 'premium-padding-jacket' LIMIT 1;
  SELECT id INTO product_hoodie FROM public.products WHERE slug = 'oversized-hoodie' LIMIT 1;
  SELECT id INTO product_headset FROM public.products WHERE slug = 'wireless-earbuds' LIMIT 1;
  SELECT id INTO product_laptop FROM public.products WHERE slug = 'premium-laptop' LIMIT 1;
  SELECT id INTO product_pants FROM public.products WHERE slug = 'slim-chino-pants' LIMIT 1;
  SELECT id INTO product_shoes FROM public.products WHERE slug = 'classic-sneakers' LIMIT 1;
  
  IF lookbook_hero IS NOT NULL THEN
    -- 점퍼 (상체 중앙)
    IF product_jacket IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_hero, product_jacket, 50, 35);
    END IF;
    
    -- 후드티 (상체)
    IF product_hoodie IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_hero, product_hoodie, 50, 40);
    END IF;
    
    -- 헤드셋 (머리 근처)
    IF product_headset IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_hero, product_headset, 60, 20);
    END IF;
    
    -- 노트북 (손)
    IF product_laptop IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_hero, product_laptop, 40, 50);
    END IF;
    
    -- 바지 (하체)
    IF product_pants IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_hero, product_pants, 50, 70);
    END IF;
    
    -- 신발 (하단)
    IF product_shoes IS NOT NULL THEN
      INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
      VALUES (lookbook_hero, product_shoes, 50, 90);
    END IF;
  END IF;
END $$;
```

---

### 2단계: 페이지 새로고침

```
http://localhost:3000
```

---

## 🎯 결과

### 첫 페이지 최상단에 표시됩니다!

```
┌─────────────────────────────────┐
│   Style Picks (룩북 섹션)        │
├─────────────────────────────────┤
│                                 │
│   📸 올인원 스타일 (1.png)       │
│        ↓                        │
│   [+] ← 헤드셋                  │
│   [+] ← 점퍼                    │
│   [+] ← 후드티                  │
│   [+] ← 노트북                  │
│   [+] ← 바지                    │
│   [+] ← 신발                    │
│                                 │
└─────────────────────────────────┘
```

### 인터랙션

1. **마우스 호버** → 상품 카드 표시
   - 상품 이미지
   - 상품 이름
   - 가격
   - "담기" 버튼

2. **클릭** → 상품 상세 페이지로 이동

---

## 🔧 위치 조정하기

실제 이미지를 보면서 위치를 조정하고 싶다면:

```sql
-- 핫스팟 위치 수정
UPDATE public.lookbook_items li
SET position_x = 새위치X, position_y = 새위치Y
FROM public.lookbooks lb
WHERE li.lookbook_id = lb.id 
  AND lb.title = '올인원 스타일'
  AND li.product_id = (SELECT id FROM public.products WHERE slug = '상품slug');
```

**예시:**
```sql
-- 점퍼 위치 조정
UPDATE public.lookbook_items li
SET position_x = 45, position_y = 30
FROM public.lookbooks lb, public.products p
WHERE li.lookbook_id = lb.id 
  AND li.product_id = p.id
  AND lb.title = '올인원 스타일'
  AND p.slug = 'premium-padding-jacket';
```

---

## 📍 좌표 가이드

```
        0%                50%               100%
         │                 │                 │
    0% ──┼─────────────────┼─────────────────┼──
         │                 │                 │
         │   헤드셋(60,20) │                 │
         │                 │                 │
   20% ──┼─────────────────●─────────────────┼──
         │                 │                 │
         │      점퍼(50,35) │                 │
   35% ──┼─────────────────●─────────────────┼──
         │                 │                 │
         │    후드티(50,40) │                 │
   40% ──┼─────────────────●─────────────────┼──
         │                 │                 │
         │  노트북(40,50)   │                 │
   50% ──┼──────────●──────┼─────────────────┼──
         │                 │                 │
         │      바지(50,70) │                 │
   70% ──┼─────────────────●─────────────────┼──
         │                 │                 │
         │      신발(50,90) │                 │
   90% ──┼─────────────────●─────────────────┼──
         │                 │                 │
  100% ──┼─────────────────┼─────────────────┼──
```

---

## ✅ 체크리스트

- [ ] Supabase SQL Editor에서 위 SQL 실행
- [ ] 에러 없이 완료 확인
- [ ] 브라우저 새로고침
- [ ] 첫 페이지 상단에 1.png 표시 확인
- [ ] `+` 아이콘 6개 확인
- [ ] 마우스 호버 시 상품 정보 표시 확인
- [ ] 클릭 시 상품 페이지 이동 확인

---

## 🎉 완료!

이제 `1.png` 이미지가 첫 페이지 최상단에 표시되고, 각 요소에 마우스를 올리면 상품 정보가 나타납니다!

필요하면 위치 조정 SQL로 핫스팟 위치를 미세 조정하세요.

