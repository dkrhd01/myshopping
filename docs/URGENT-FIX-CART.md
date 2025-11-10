# 🚨 긴급: 장바구니 테이블 생성하기

## 현재 문제
```
장바구니 추가에 실패했습니다. 
오류: Could not find the table 'public.cart_items' in the schema cache
```

**원인**: Supabase에 `cart_items` 테이블이 생성되지 않았습니다.

---

## ✅ 5분 안에 해결하기

### 1단계: Supabase Dashboard 접속

1. 브라우저에서 https://supabase.com/dashboard 열기
2. 로그인
3. 사용 중인 프로젝트 클릭

### 2단계: SQL Editor 열기

1. 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. 우측 상단의 **"New query"** 버튼 클릭

### 3단계: SQL 코드 복사 및 실행

프로젝트 루트의 **`SETUP-DATABASE-NOW.sql`** 파일을 열고:

1. **전체 내용 복사** (Ctrl+A → Ctrl+C)
2. Supabase SQL Editor에 **붙여넣기** (Ctrl+V)
3. 우측 하단 **"Run"** 버튼 클릭 (또는 Ctrl+Enter)

### 4단계: 성공 확인

SQL 실행 후 하단에 다음 메시지가 나타나야 합니다:
```
✅ 테이블 생성 완료! 이제 장바구니를 사용할 수 있습니다.
```

### 5단계: 테이블 확인

같은 SQL Editor에서 다음 쿼리 실행:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**예상 결과**:
```
cart_items   ✓
order_items  ✓
orders       ✓
products     ✓
users        ✓
```

---

## 🧪 테스트하기

### 1. 브라우저 새로고침
- F5 키 누르기

### 2. 디버그 페이지 확인
1. `http://localhost:3000/debug/cart` 접속
2. "데이터베이스 확인" 버튼 클릭
3. 모든 테이블이 "Yes"인지 확인

### 3. 장바구니 추가 테스트
1. 상품 목록 페이지로 이동
2. 상품 클릭
3. "장바구니에 담기" 버튼 클릭
4. **성공 메시지 확인!**

---

## ❌ 에러가 계속 나는 경우

### Case 1: "relation already exists" 에러

일부 테이블만 생성된 경우입니다. 다음 SQL을 실행하세요:

```sql
-- 기존 테이블 삭제 (주의: 데이터도 삭제됨)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

그 다음 **`SETUP-DATABASE-NOW.sql`** 다시 실행

### Case 2: "permission denied" 에러

Supabase 프로젝트의 관리자 권한이 없습니다.
- 프로젝트 소유자에게 권한 요청
- 또는 새 프로젝트 생성

### Case 3: 다른 에러

1. 에러 메시지 전체 복사
2. 브라우저 콘솔 (F12) 확인
3. 서버 터미널 로그 확인

---

## 📸 스크린샷 가이드

### Supabase SQL Editor 찾기
```
Dashboard 화면
├── 왼쪽 메뉴 바
│   ├── Home
│   ├── Table Editor
│   ├── SQL Editor  ← 여기!
│   ├── Database
│   └── ...
```

### SQL 실행 버튼
```
SQL Editor 화면
├── 상단: 쿼리 제목 입력란
├── 중간: SQL 코드 입력 영역 (여기에 붙여넣기)
└── 하단 우측: [Run] 버튼 ← 클릭!
```

---

## 💡 팁

- **복사 시 주의**: 전체 SQL 파일 내용을 빠짐없이 복사하세요
- **실행 순서**: SQL은 위에서 아래로 순차 실행됩니다
- **에러 무시**: "already exists" 에러는 무시해도 됩니다 (이미 있다는 의미)
- **시간**: 보통 5-10초면 완료됩니다

---

## ✅ 완료 체크리스트

- [ ] Supabase SQL Editor에서 SQL 실행 완료
- [ ] "테이블 생성 완료" 메시지 확인
- [ ] 테이블 목록 쿼리로 5개 테이블 확인
- [ ] `/debug/cart` 페이지에서 "Yes" 확인
- [ ] 장바구니 추가 성공!

---

## 🆘 도움이 필요하면

1. 에러 메시지 스크린샷
2. SQL Editor 화면 스크린샷
3. 브라우저 콘솔 (F12) 로그
4. 서버 터미널 로그

위 정보를 첨부해서 문의하세요!

