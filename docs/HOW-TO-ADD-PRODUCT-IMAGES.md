# 상품 이미지 추가 가이드

## ✅ 완료된 작업

1. **데이터베이스에 image_url 컬럼 추가**
2. **기존 20개 상품에 Unsplash 고품질 이미지 자동 할당**
3. **상품 카드에 이미지 표시**
4. **상품 상세 페이지에 큰 이미지 표시**

---

## 🚀 이미지 즉시 적용하기

### 1. Supabase Dashboard에서 SQL 실행

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. SQL Editor 클릭
4. 아래 SQL 복사 후 실행:

```sql
-- 상품 이미지 URL 컬럼 추가
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

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
```

### 2. 개발 서버 재시작

```bash
# 터미널에서 Ctrl+C로 서버 중지 후
pnpm dev
```

### 3. 브라우저에서 확인

- http://localhost:3000/products

---

## 📸 이미지 표시 위치

### 1. 홈 페이지
- 상품 카드에 정사각형 이미지
- 호버 시 확대 효과

### 2. 상품 목록 페이지
- 각 카드에 이미지 표시
- 카테고리 배지 오버레이

### 3. 상품 상세 페이지
- 상단에 큰 16:9 비율 이미지
- 고해상도 디스플레이 최적화

---

## 🎨 새 상품에 이미지 추가하기

### 방법 1: Unsplash URL 사용

```sql
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-{id}?w=800&q=80' 
WHERE slug = 'your-product-slug';
```

**Unsplash에서 이미지 찾기:**
1. https://unsplash.com 접속
2. 원하는 이미지 검색
3. 이미지 클릭 → "Copy Image Address" 복사
4. URL 끝에 `?w=800&q=80` 추가

### 방법 2: 직접 이미지 URL 사용

```sql
UPDATE public.products 
SET image_url = 'https://your-cdn.com/image.jpg' 
WHERE id = 'product-uuid';
```

### 방법 3: 관리자 UI 사용 (향후 구현 예정)

- `/admin/products/new` 페이지에서 이미지 업로드
- Supabase Storage에 자동 저장
- 썸네일 자동 생성

---

## 🖼️ 이미지 권장 사항

### 해상도
- **최소**: 800x800px
- **권장**: 1200x1200px 이상
- **최대**: 2400x2400px

### 파일 크기
- 100KB ~ 500KB (최적화 후)

### 형식
- JPG (사진)
- PNG (그래픽, 투명 배경)
- WebP (최적화)

### 비율
- **상품 카드**: 정사각형 (1:1)
- **상세 페이지**: 16:9 또는 4:3

---

## ⚙️ 기술 세부사항

### Next.js Image 최적화
- 자동 WebP 변환
- Lazy loading
- 반응형 이미지 자동 생성
- 다양한 크기 생성 (sizes 속성)

### 허용된 이미지 도메인
- `images.unsplash.com`
- `img.clerk.com`

추가 도메인이 필요하면 `next.config.ts` 수정:

```typescript
images: {
  remotePatterns: [
    { hostname: "images.unsplash.com" },
    { hostname: "your-cdn.com" }, // 여기에 추가
  ],
}
```

---

## 🐛 문제 해결

### 이미지가 안 보여요

1. **Supabase에서 image_url 컬럼 생성 확인**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'image_url';
```

2. **이미지 URL 확인**
```sql
SELECT slug, image_url FROM public.products LIMIT 5;
```

3. **개발 서버 재시작**
```bash
pnpm dev
```

### 이미지가 깨져요

- URL이 정확한지 확인
- 브라우저에서 직접 URL 열어서 확인
- next.config.ts에 도메인 추가 확인

### 이미지가 느려요

- `?w=800&q=80` 파라미터로 크기 최적화
- CDN 사용 (Unsplash는 자동으로 CDN 사용)

---

## 💡 팁

- **무료 고품질 이미지**: Unsplash, Pexels, Pixabay
- **이미지 최적화**: tinypng.com, squoosh.app
- **일관된 스타일**: 같은 사이트에서 이미지 선택
- **배경 제거**: remove.bg

---

## 🔜 향후 계획

- [ ] 관리자 페이지에서 이미지 업로드
- [ ] Supabase Storage 통합
- [ ] 다중 이미지 지원 (갤러리)
- [ ] 이미지 자동 리사이징
- [ ] 워터마크 추가 옵션

