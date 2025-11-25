# 배경 제거된 룩북 이미지 사용 가이드

## 🎯 더 자연스러운 디자인을 위한 팁

첨부하신 이미지처럼 **배경이 제거되고 자연스러운** 룩북을 만들려면 배경이 투명한 PNG 이미지를 사용하세요.

---

## 🖼️ 배경 제거 방법

### 1. Remove.bg (추천)
- **웹사이트**: https://www.remove.bg
- **무료**: 월 50장
- **사용법**:
  1. 이미지 업로드
  2. 자동 배경 제거
  3. HD 다운로드
  4. Supabase Storage에 업로드

### 2. Photopea (무료)
- **웹사이트**: https://www.photopea.com
- **사용법**:
  1. 이미지 열기
  2. Magic Wand Tool로 배경 선택
  3. Delete
  4. PNG로 저장

### 3. Canva Pro
- **Magic Eraser** 기능 사용
- 드래그로 배경 제거

---

## 📸 추천 이미지 소스

### 배경 제거된 패션 이미지

1. **PNG Tree**
   - https://pngtree.com
   - 이미 배경이 제거된 PNG
   - 검색: "fashion model png", "person standing png"

2. **FreePik**
   - https://www.freepik.com
   - 필터: "PNG" 선택
   - 고품질 배경 제거 이미지

3. **Unsplash + Remove.bg**
   - Unsplash에서 좋은 사진 선택
   - Remove.bg로 배경 제거

---

## 🎨 이상적인 룩북 이미지

### 구도
```
  여백
    ↓
┌─────────┐
│         │ ← 인물 중앙 배치
│  사람   │
│         │
└─────────┘
    ↑
  여백
```

### 사양
- **배경**: 투명 (PNG)
- **해상도**: 1500x2000px 이상
- **비율**: 3:4 또는 4:5
- **자세**: 전신 또는 7부 이상
- **조명**: 균일한 조명

---

## 🚀 Supabase Storage에 업로드

### 1. Supabase Dashboard
```
1. Storage 메뉴
2. 새 버킷 생성: "lookbooks"
3. Public으로 설정
4. 이미지 업로드
5. URL 복사
```

### 2. 룩북에 적용
```sql
-- 배경 제거된 이미지로 업데이트
UPDATE public.lookbooks 
SET image_url = 'https://your-project.supabase.co/storage/v1/object/public/lookbooks/winter-look.png'
WHERE id = '룩북-UUID';
```

---

## 💡 디자인 팁

### 1. 페이지 배경과 조화
```css
/* app/page.tsx 배경 */
background: white 또는 gradient-to-b from-gray-50
```

이미지 배경이 투명하면 페이지 배경과 자연스럽게 어우러집니다.

### 2. 그림자 효과 (선택)
```tsx
<div className="drop-shadow-2xl">
  <Image ... />
</div>
```

### 3. 여러 인물 레이아웃
```
┌──────────────────────────────┐
│  인물1    인물2    인물3      │
│   ↓       ↓       ↓          │
│  룩1      룩2      룩3        │
└──────────────────────────────┘
```

---

## 📦 샘플 이미지 교체

### 현재 이미지 교체하기

```sql
-- 겨울 캐주얼 룩 이미지 교체
UPDATE public.lookbooks 
SET image_url = 'https://your-transparent-image.png'
WHERE title = '겨울 캐주얼 룩';

-- 스포티 룩 이미지 교체
UPDATE public.lookbooks 
SET image_url = 'https://your-transparent-image2.png'
WHERE title = '스포티 룩';
```

---

## 🎯 최종 결과

### Before (현재)
```
┌───────────────────┐
│ ███████████████ │ ← 박스 안 이미지
│ ███ 사진 ████ │
│ ███████████████ │
└───────────────────┘
```

### After (개선)
```
  🧍‍♂️  ← 배경 없이 자연스럽게
     (투명 PNG)
```

---

## 🔧 현재 적용된 개선사항

✅ 박스 테두리 제거
✅ 둥근 모서리 제거
✅ 배경 그라데이션 제거
✅ `object-cover` → `object-contain`으로 변경
✅ 그림자 최소화
✅ 미니멀한 핫스팟 디자인
✅ 깔끔한 툴팁 카드

---

## 📝 체크리스트

배경 제거된 자연스러운 룩북을 만들려면:

- [ ] 배경 투명 PNG 이미지 준비
- [ ] Supabase Storage에 업로드
- [ ] URL을 lookbooks 테이블에 업데이트
- [ ] 페이지 새로고침
- [ ] 자연스러운 레이아웃 확인

---

첨부하신 이미지처럼 깔끔하고 자연스러운 룩북이 완성됩니다! 🎨✨

