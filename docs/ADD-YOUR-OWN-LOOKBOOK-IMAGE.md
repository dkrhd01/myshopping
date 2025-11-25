# 🖼️ 내 사진으로 룩북 만들기

## 가장 간단한 방법

### 1단계: 사진 파일 복사

프로젝트 폴더에서:

```
public/lookbooks/
```

이 폴더에 여러분의 사진을 복사하세요!

**예시:**
```
public/lookbooks/
  ├── my-winter-look.jpg
  ├── my-summer-look.png
  └── my-casual-look.jpg
```

---

### 2단계: Supabase에서 URL 업데이트

**Supabase Dashboard → SQL Editor**에서 실행:

```sql
-- 기존 룩북의 이미지 변경
UPDATE public.lookbooks 
SET image_url = '/lookbooks/my-winter-look.jpg'
WHERE title = '겨울 캐주얼 룩';

UPDATE public.lookbooks 
SET image_url = '/lookbooks/my-summer-look.png'
WHERE title = '스포티 룩';
```

---

### 3단계: 새 룩북 추가

```sql
-- 완전히 새로운 룩북 추가
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '내 스타일',
  '내가 만든 코디',
  '/lookbooks/my-casual-look.jpg',  -- 여기에 파일명
  3,
  true
);

-- 상품 연결 (룩북 ID와 상품 ID 필요)
-- 먼저 방금 생성된 룩북 ID 확인
SELECT id, title FROM public.lookbooks ORDER BY created_at DESC LIMIT 1;

-- 그 ID를 사용하여 상품 연결
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
VALUES 
  ('룩북-UUID', '상품1-UUID', 30, 50),
  ('룩북-UUID', '상품2-UUID', 60, 40),
  ('룩북-UUID', '상품3-UUID', 45, 70);
```

---

## 🎨 이미지 권장 사항

### 파일 형식
- ✅ **JPG**: 일반 사진
- ✅ **PNG**: 배경 제거된 사진 (추천!)
- ✅ **WebP**: 최적화된 형식

### 크기
- **해상도**: 1200x1500px 이상
- **비율**: 4:5 또는 3:4
- **파일 크기**: 1MB 이하 권장

---

## 📍 상품 위치 찾기

사진에서 상품이 어디 있는지 위치를 지정해야 합니다.

### 좌표 시스템

```
(0, 0) ────────── (100, 0)
  │                    │
  │    (50, 50)       │
  │      중앙          │
  │                    │
(0, 100) ──────── (100, 100)
```

### 위치 예시

**머리 근처 (이어폰, 모자 등):**
```sql
position_x = 50, position_y = 20
```

**상체 중앙 (가방, 상의 등):**
```sql
position_x = 50, position_y = 40
```

**하체 (신발, 바지 등):**
```sql
position_x = 50, position_y = 80
```

**왼쪽:**
```sql
position_x = 30
```

**오른쪽:**
```sql
position_x = 70
```

---

## 🔧 전체 예시

### 내 사진으로 완전히 새로운 룩북 만들기

1. **사진 준비**
   ```
   public/lookbooks/my-awesome-look.png
   ```

2. **SQL 실행**
   ```sql
   -- 룩북 생성
   INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
   VALUES (
     '나만의 스타일',
     '개인적으로 추천하는 코디',
     '/lookbooks/my-awesome-look.png',
     1,
     true
   )
   RETURNING id;
   
   -- 나온 ID를 복사 (예: abc123...)
   
   -- 상품들 찾기
   SELECT id, name FROM public.products WHERE is_active = true LIMIT 10;
   
   -- 상품 3개 연결
   INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
   VALUES 
     ('abc123...', '상품1-id', 35, 30),  -- 왼쪽 상단
     ('abc123...', '상품2-id', 50, 55),  -- 중앙
     ('abc123...', '상품3-id', 65, 75);  -- 오른쪽 하단
   ```

3. **페이지 새로고침**
   ```
   http://localhost:3000
   ```

---

## 💡 팁

### 배경 제거하기
1. https://www.remove.bg 접속
2. 사진 업로드
3. 배경 제거된 PNG 다운로드
4. `public/lookbooks/`에 저장

### 여러 사진 한번에
```sql
-- 여러 룩북 한번에 업데이트
UPDATE public.lookbooks SET image_url = '/lookbooks/look1.jpg' WHERE id = 'id1';
UPDATE public.lookbooks SET image_url = '/lookbooks/look2.jpg' WHERE id = 'id2';
UPDATE public.lookbooks SET image_url = '/lookbooks/look3.jpg' WHERE id = 'id3';
```

---

## ✅ 체크리스트

- [ ] 사진을 `public/lookbooks/` 폴더에 복사
- [ ] Supabase SQL Editor 열기
- [ ] 이미지 URL 업데이트 또는 새 룩북 생성
- [ ] 상품 연결 (옵션)
- [ ] 브라우저에서 확인

---

## 🐛 문제 해결

### 이미지가 안 보여요
1. 파일명 확인 (공백, 특수문자 없이)
2. 파일 경로 확인: `/lookbooks/파일명.jpg`
3. 개발 서버 재시작

### 상품 위치가 이상해요
- SQL에서 `position_x`, `position_y` 값 조정
- 0~100 사이 값으로 변경

---

이제 여러분만의 룩북을 만들 수 있습니다! 🎨✨

