# 장바구니 추가 실패 문제 해결 가이드

## 문제 증상

상품을 장바구니에 담을 때 "장바구니 추가에 실패했습니다" 메시지가 표시됩니다.

## 주요 원인 및 해결 방법

### 1. 사용자 동기화 문제 (가장 흔한 원인)

**원인**: Clerk로 로그인한 사용자가 Supabase `users` 테이블에 동기화되지 않았습니다.

**해결 방법**:

#### 방법 A: 디버그 페이지 사용 (추천)

1. 브라우저에서 `/debug/cart` 페이지로 이동
2. "사용자 동기화" 버튼 클릭
3. "데이터베이스 확인" 버튼 클릭하여 동기화 확인
4. 모든 체크가 성공하면 상품 페이지로 돌아가서 다시 시도

#### 방법 B: 수동 새로고침

1. 브라우저에서 페이지 새로고침 (F5 또는 Ctrl+R)
2. 자동으로 사용자 동기화가 실행됩니다
3. 5초 정도 기다린 후 장바구니에 상품 추가 시도

#### 방법 C: 로그아웃 후 재로그인

1. 우측 상단 사용자 아이콘 클릭
2. "로그아웃" 선택
3. 다시 로그인
4. 자동으로 사용자 동기화가 실행됩니다

### 2. 데이터베이스 테이블 미생성

**원인**: `users` 또는 `cart_items` 테이블이 Supabase에 생성되지 않았습니다.

**해결 방법**:

1. Supabase Dashboard로 이동
2. SQL Editor 열기
3. 다음 SQL 실행:

```sql
-- Users 테이블 확인
SELECT * FROM public.users LIMIT 1;

-- Cart items 테이블 확인
SELECT * FROM public.cart_items LIMIT 1;
```

4. 테이블이 없다는 에러가 나면 마이그레이션 실행:

```bash
# 로컬 개발 환경
npx supabase db reset

# 또는 Supabase Dashboard에서 마이그레이션 파일 직접 실행
```

### 3. RLS (Row Level Security) 문제

**원인**: RLS가 활성화되어 있어 데이터 접근이 차단됩니다.

**해결 방법**:

Supabase Dashboard SQL Editor에서 다음 실행:

```sql
-- RLS 비활성화 (개발 환경)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.cart_items TO anon, authenticated, service_role;
```

### 4. 환경 변수 누락

**원인**: Supabase 연결에 필요한 환경 변수가 설정되지 않았습니다.

**해결 방법**:

`.env.local` 파일에 다음 변수가 있는지 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

값이 없거나 잘못되었다면:

1. Supabase Dashboard → Settings → API
2. Project URL, anon key, service_role key 복사
3. `.env.local` 파일에 붙여넣기
4. 개발 서버 재시작: `pnpm dev`

## 디버깅 도구

### 브라우저 콘솔 확인

1. F12 키를 눌러 개발자 도구 열기
2. Console 탭 선택
3. 장바구니에 상품 추가 시도
4. 로그에서 `[CartActions]` 메시지 확인

**주요 로그 메시지**:

- `✓ User context resolved`: 사용자 인증 성공
- `✗ No user context`: 로그인 필요 또는 동기화 필요
- `Product query result`: 상품 조회 결과
- `Insert successful`: 장바구니 추가 성공

### 디버그 페이지 사용

`/debug/cart` 페이지에서:

- 실시간 로그 확인
- 사용자 동기화 상태 확인
- 데이터베이스 연결 테스트
- 테이블 존재 여부 확인

## 추가 도움

위 방법으로 해결되지 않으면:

1. 브라우저 콘솔의 에러 메시지 전체 복사
2. `/debug/cart` 페이지의 로그 전체 복사
3. 서버 터미널의 로그 확인
4. 이슈 보고 시 위 정보 첨부

## 프로덕션 배포 전 체크리스트

- [ ] 모든 마이그레이션 파일이 Supabase에 적용되었는가?
- [ ] 사용자 동기화가 자동으로 작동하는가?
- [ ] 환경 변수가 모두 설정되었는가?
- [ ] RLS 정책을 프로덕션에 맞게 수정했는가? (현재는 개발용으로 비활성화)
- [ ] `/debug/cart` 페이지를 프로덕션에서 제거하거나 인증을 추가했는가?

