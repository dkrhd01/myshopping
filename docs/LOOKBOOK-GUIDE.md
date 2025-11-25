# 인터랙티브 룩북 가이드

## 🎯 개요

첨부하신 이미지처럼, 코디 사진 위에 상품들을 핫스팟으로 표시하고 마우스 호버 시 상품 정보를 보여주는 인터랙티브 룩북 기능입니다.

### 주요 기능
- ✅ 코디 이미지 위에 상품 위치 표시
- ✅ 마우스 호버 시 상품 정보 카드 표시
- ✅ 클릭 시 상품 상세 페이지로 이동
- ✅ 부드러운 애니메이션 효과
- ✅ 하단에 포함된 상품 목록 표시

---

## 🚀 즉시 적용하기

### 1. Supabase Dashboard에서 SQL 실행

1. https://supabase.com/dashboard 접속
2. SQL Editor 클릭
3. 프로젝트 루트의 **`supabase/migrations/20250104010000_create_lookbooks.sql`** 파일 내용 복사 후 실행

이 SQL은 다음을 수행합니다:
- `lookbooks` 테이블 생성 (코디 이미지 정보)
- `lookbook_items` 테이블 생성 (이미지 내 상품 위치)
- 샘플 룩북 2개 자동 추가
- 기존 상품들과 자동 연결

### 2. 개발 서버 재시작

```bash
# 터미널에서 Ctrl+C 후
pnpm dev
```

### 3. 브라우저에서 확인

- http://localhost:3000 (홈페이지 상단에 표시)
- "스타일 추천" 섹션에서 확인

---

## 📸 사용 방법

### 사용자 관점

1. **룩북 이미지 확인**
   - 홈페이지에 코디 이미지가 표시됩니다
   - 이미지 위에 펄스 애니메이션이 있는 `+` 아이콘이 보입니다

2. **마우스 호버**
   - `+` 아이콘에 마우스를 올리면
   - 상품 이미지, 이름, 가격이 담긴 카드가 나타납니다
   - 부드러운 페이드 애니메이션 효과

3. **클릭하여 구매**
   - 카드를 클릭하면 해당 상품 상세 페이지로 이동
   - 장바구니 담기, 상세 정보 확인 가능

4. **하단 상품 목록**
   - 룩북 이미지 하단에 포함된 모든 상품 목록 표시
   - 작은 썸네일과 가격 정보 제공

---

## 🛠️ 관리자용: 새 룩북 추가하기

### 방법 1: SQL로 직접 추가

```sql
-- 1. 룩북 추가
INSERT INTO public.lookbooks (title, description, image_url, display_order, is_active)
VALUES (
  '봄 캐주얼 룩',
  '따뜻한 봄날을 위한 편안한 스타일',
  'https://images.unsplash.com/photo-your-image-id?w=1200&q=80',
  3,  -- 표시 순서
  true
)
RETURNING id;

-- 2. 상품 연결 (위에서 반환된 lookbook id 사용)
INSERT INTO public.lookbook_items (lookbook_id, product_id, position_x, position_y)
VALUES 
  ('룩북-UUID', '상품1-UUID', 30, 40),  -- x: 30%, y: 40% 위치
  ('룩북-UUID', '상품2-UUID', 60, 70),  -- x: 60%, y: 70% 위치
  ('룩북-UUID', '상품3-UUID', 80, 25);  -- x: 80%, y: 25% 위치
```

### 좌표 시스템 이해하기

```
이미지 좌표 (퍼센트 단위)

(0, 0) ────────────── (100, 0)
  │                        │
  │     (50, 50)          │
  │        중앙            │
  │                        │
(0, 100) ────────── (100, 100)

예시:
- position_x: 0 = 왼쪽 끝
- position_x: 50 = 가로 중앙
- position_x: 100 = 오른쪽 끝
- position_y: 0 = 상단 끝
- position_y: 50 = 세로 중앙
- position_y: 100 = 하단 끝
```

### 방법 2: 상품 UUID 찾기

```sql
-- 상품 목록에서 UUID 찾기
SELECT id, name, slug FROM public.products WHERE is_active = true;
```

---

## 🎨 커스터마이징

### 1. 핫스팟 스타일 변경

`components/lookbook/interactive-lookbook.tsx` 파일에서:

```tsx
// 핫스팟 마커 크기/색상 변경
<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary">
  {/* h-10 w-10 을 h-12 w-12 로 변경하면 더 크게 */}
  {/* bg-primary를 bg-blue-500 등으로 변경 가능 */}
</div>
```

### 2. 툴팁 카드 스타일 변경

```tsx
// 카드 크기 변경
<div className="w-64">
  {/* w-64를 w-80 등으로 변경 */}
</div>
```

### 3. 애니메이션 속도 조정

```tsx
// 페이드 애니메이션 속도
transition={{ duration: 0.2 }}
// duration 값을 0.3, 0.5 등으로 조정
```

---

## 📊 데이터베이스 구조

### lookbooks 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 룩북 고유 ID |
| title | TEXT | 룩북 제목 |
| description | TEXT | 룩북 설명 |
| image_url | TEXT | 코디 이미지 URL |
| display_order | INTEGER | 표시 순서 (낮을수록 먼저) |
| is_active | BOOLEAN | 활성화 여부 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 수정 시간 |

### lookbook_items 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 아이템 고유 ID |
| lookbook_id | UUID | 룩북 ID (외래키) |
| product_id | UUID | 상품 ID (외래키) |
| position_x | NUMERIC | 이미지 내 X 좌표 (0-100%) |
| position_y | NUMERIC | 이미지 내 Y 좌표 (0-100%) |
| created_at | TIMESTAMPTZ | 생성 시간 |

---

## 🖼️ 이미지 권장 사항

### 룩북 이미지
- **해상도**: 1200x1500px 이상 (4:5 비율)
- **형식**: JPG, WebP
- **파일 크기**: 300KB ~ 1MB
- **내용**: 전신 사진, 밝은 배경

### 상품 위치 팁
1. **명확한 위치**: 실제 상품이 이미지에서 보이는 곳에 핫스팟 배치
2. **겹치지 않게**: 핫스팟들이 너무 가깝지 않게 배치
3. **여백 확보**: 이미지 가장자리에서 5% 이상 떨어뜨리기
4. **3-5개 권장**: 한 룩북당 3-5개 상품이 적당

---

## ⚙️ 기술 세부사항

### 사용된 라이브러리
- **Framer Motion**: 부드러운 애니메이션
- **Next.js Image**: 이미지 최적화
- **Tailwind CSS**: 스타일링
- **Supabase**: 데이터베이스

### 컴포넌트 구조
```
components/lookbook/
  └── interactive-lookbook.tsx (메인 컴포넌트)

app/actions/
  └── lookbooks.ts (서버 액션)

app/page.tsx (홈페이지에 통합)
```

### 성능 최적화
- ✅ 이미지 lazy loading
- ✅ 호버 시에만 툴팁 렌더링
- ✅ Server Component로 초기 로딩 최적화
- ✅ Client Component는 인터랙션만 담당

---

## 🐛 문제 해결

### 룩북이 안 보여요

1. **테이블 생성 확인**
```sql
SELECT * FROM public.lookbooks WHERE is_active = true;
```

2. **상품 연결 확인**
```sql
SELECT lb.title, COUNT(li.id) as product_count
FROM public.lookbooks lb
LEFT JOIN public.lookbook_items li ON lb.id = li.lookbook_id
GROUP BY lb.id, lb.title;
```

3. **개발 서버 재시작**
```bash
pnpm dev
```

### 호버가 안 돼요

- 브라우저 개발자 도구 Console 확인
- JavaScript 에러 체크
- framer-motion 설치 확인: `pnpm list framer-motion`

### 이미지가 안 나와요

- `next.config.ts`에서 이미지 도메인 확인
- Unsplash 이미지 URL 확인
- 브라우저에서 직접 이미지 URL 열어보기

---

## 🔜 향후 개선 아이디어

- [ ] 관리자 페이지에서 룩북 생성 UI
- [ ] 드래그 앤 드롭으로 핫스팟 위치 지정
- [ ] 여러 이미지 슬라이더
- [ ] 동영상 룩북 지원
- [ ] 좋아요/공유 기능
- [ ] 모바일 전용 핫스팟 크기 조정

---

## 💡 활용 예시

### 패션 쇼핑몰
- 계절별 코디 추천
- 스타일별 룩북 (캐주얼, 포멀, 스포티)
- 인플루언서 협업 룩

### 가구/인테리어 쇼핑몰
- 방 전체 인테리어 룩
- 색상 조합 제안
- 스타일별 공간 연출

### 전자기기 쇼핑몰
- 데스크 셋업 추천
- 홈 오피스 구성
- 게이밍 룩

---

## 📚 참고 자료

- [Framer Motion 문서](https://www.framer.com/motion/)
- [Next.js Image 최적화](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Supabase 관계형 쿼리](https://supabase.com/docs/guides/database/joins-and-relationships)

---

첨부하신 이미지와 같은 멋진 룩북 기능이 완성되었습니다! 🎉

