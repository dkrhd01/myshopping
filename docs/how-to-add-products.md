# 상품 추가하기 가이드

이 가이드에서는 상품을 추가하는 가장 쉬운 방법을 설명합니다.

## 🚨 중요: 테이블이 없다면?

**"relation public.products does not exist"** 에러가 발생했다면, 테이블을 먼저 생성해야 합니다!

### ✅ 해결 방법: 전체 설정 SQL 사용 (추천)

테이블 생성과 상품 추가를 한 번에 하는 통합 SQL 파일을 사용하세요:

**파일 위치**: `docs/setup-products-complete.sql`

이 파일을 Supabase SQL Editor에서 실행하면 테이블이 자동으로 생성되고 20개의 상품이 추가됩니다.

---

## 🎯 방법 1: 전체 설정 SQL 사용 (테이블 생성 + 상품 추가)

### 1단계: Supabase Dashboard 열기
1. 웹 브라우저에서 [Supabase Dashboard](https://app.supabase.com)로 이동
2. 로그인 후 본인의 프로젝트 선택

### 2단계: SQL Editor 열기
1. 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. 화면 상단의 **"New query"** 버튼 클릭

### 3단계: 통합 SQL 파일 열기
프로젝트 폴더에서 다음 파일을 열고 전체 내용을 복사하세요:
- `docs/setup-products-complete.sql`

### 4단계: SQL 실행
1. SQL Editor에 붙여넣기
2. 오른쪽 하단의 **"RUN"** 버튼 클릭 (또는 `Ctrl + Enter`)
3. 성공 메시지 확인

---

## 📝 방법 2: 테이블이 이미 있는 경우 (상품만 추가)

테이블이 이미 생성되어 있다면, 아래 코드를 복사하세요:

```sql
INSERT INTO public.products (name, slug, description, price, currency, category, inventory_quantity, is_active)
VALUES
  (
    '애플 에어팟 프로 3세대',
    'apple-airpods-pro-3rd-gen',
    '액티브 노이즈 캔슬링과 공간 음향을 지원하는 프리미엄 무선 이어버드입니다.',
    359000,
    'KRW',
    'electronics',
    50,
    true
  ),
  (
    '갤럭시 워치 7 클래식',
    'samsung-galaxy-watch-7-classic',
    '건강 추적과 스마트 기능이 탑재된 프리미엄 스마트워치입니다.',
    499000,
    'KRW',
    'electronics',
    30,
    true
  ),
  (
    '아이폰 16 프로 케이스',
    'iphone-16-pro-case',
    '방수 및 충격 보호 기능이 있는 실리콘 보호 케이스입니다.',
    49000,
    'KRW',
    'gadgets',
    150,
    true
  ),
  (
    '나이키 에어맥스 270',
    'nike-air-max-270',
    '편안한 착화감과 스타일을 겸비한 러닝화입니다.',
    169000,
    'KRW',
    'clothing',
    80,
    true
  ),
  (
    '유니클로 히트텍 후드티',
    'uniqlo-heattech-hoodie',
    '보온 기능이 뛰어난 기능성 후드티입니다.',
    59000,
    'KRW',
    'clothing',
    120,
    true
  ),
  (
    '스타벅스 콜드브루 원두 500g',
    'starbucks-coldbrew-beans-500g',
    '부드러운 맛과 향이 특징인 콜드브루 전용 원두입니다.',
    25000,
    'KRW',
    'food',
    200,
    true
  ),
  (
    '고메 치즈케이크',
    'gourmet-cheesecake',
    '부드럽고 진한 맛의 프리미엄 치즈케이크입니다.',
    32000,
    'KRW',
    'food',
    40,
    true
  ),
  (
    '라네즈 워터뱅크 하이드로 크림',
    'laneige-waterbank-hydro-cream',
    '수분 공급과 보습에 특화된 스킨케어 크림입니다.',
    35000,
    'KRW',
    'beauty',
    90,
    true
  ),
  (
    '더마코스메틱 비타민C 세럼',
    'dermacosmetic-vitamin-c-serum',
    '피부 톤 개선과 미백에 도움을 주는 고농축 세럼입니다.',
    42000,
    'KRW',
    'beauty',
    75,
    true
  ),
  (
    '이케아 포토 프레임 세트',
    'ikea-photo-frame-set',
    '다양한 사이즈의 프레임으로 구성된 세트입니다.',
    45000,
    'KRW',
    'home',
    60,
    true
  ),
  (
    '다이슨 V15 무선청소기',
    'dyson-v15-cordless-vacuum',
    '강력한 흡입력과 긴 사용시간을 자랑하는 무선청소기입니다.',
    890000,
    'KRW',
    'home',
    25,
    true
  ),
  (
    '요가 매트 프리미엄',
    'yoga-mat-premium',
    '미끄럼 방지 기능이 있는 고품질 요가 매트입니다.',
    89000,
    'KRW',
    'wellness',
    100,
    true
  ),
  (
    '무선 마사지기',
    'wireless-massager',
    '다양한 진동 모드와 열 기능이 있는 휴대용 마사지기입니다.',
    129000,
    'KRW',
    'wellness',
    55,
    true
  ),
  (
    '아이패드 프로 13인치',
    'ipad-pro-13-inch',
    'M4 칩과 레티나 디스플레이를 탑재한 프리미엄 태블릿입니다.',
    1590000,
    'KRW',
    'electronics',
    15,
    true
  ),
  (
    '소니 WH-1000XM5 헤드폰',
    'sony-wh-1000xm5-headphones',
    '업계 최고 수준의 노이즈 캔슬링 기능을 갖춘 헤드폰입니다.',
    649000,
    'KRW',
    'electronics',
    35,
    true
  ),
  (
    '맥북 프로 16인치 M4',
    'macbook-pro-16-inch-m4',
    '프로페셔널 작업에 최적화된 고성능 노트북입니다.',
    3290000,
    'KRW',
    'electronics',
    10,
    true
  ),
  (
    '삼성 갤럭시 S24 울트라',
    'samsung-galaxy-s24-ultra',
    'AI 기능과 카메라 성능이 강화된 플래그십 스마트폰입니다.',
    1490000,
    'KRW',
    'electronics',
    20,
    true
  ),
  (
    '레고 아이콘 시리즈 모델',
    'lego-icon-series-model',
    '수집가를 위한 프리미엄 레고 아이콘 시리즈입니다.',
    89000,
    'KRW',
    'gadgets',
    85,
    true
  ),
  (
    '에르메스 실크 스카프',
    'hermes-silk-scarf',
    '클래식한 패턴의 명품 실크 스카프입니다.',
    890000,
    'KRW',
    'clothing',
    5,
    true
  ),
  (
    '컨버스 척 테일러 올스타',
    'converse-chuck-taylor-all-star',
    '클래식한 디자인의 캐주얼 스니커즈입니다.',
    79000,
    'KRW',
    'clothing',
    180,
    true
  );
```

### 4단계: SQL 실행
1. SQL Editor의 빈 텍스트 영역에 복사한 코드 붙여넣기
2. 화면 오른쪽 하단의 **"RUN"** 버튼 클릭 (또는 `Ctrl + Enter`)
3. 잠시 기다리면 하단에 결과 메시지 표시
4. 성공 메시지 확인: "Success. 20 rows inserted."

### 5단계: 확인하기
1. 왼쪽 메뉴에서 **"Table Editor"** 클릭
2. **"products"** 테이블 선택
3. 추가된 상품 목록 확인

---

## 🖥️ 방법 2: 웹사이트에서 직접 추가 (UI 사용)

### 1단계: 로그인
1. 웹사이트에서 로그인
2. 상단 네비게이션 바의 **"상품 추가"** 버튼 클릭

### 2단계: 상품 정보 입력
- **상품명**: 예) "새로운 상품명"
- **가격**: 예) 100000
- **재고 수량**: 예) 50
- **카테고리**: 예) electronics, clothing, food 등
- **설명**: 상품에 대한 설명 (선택사항)
- **Slug**: 자동 생성되거나 수동 입력 (선택사항)

### 3단계: 저장
- **"상품 추가"** 버튼 클릭
- 성공 메시지 확인 후 상품 목록으로 이동

---

## 💡 팁

- **Slug 중복 주의**: 동일한 slug가 이미 있으면 에러가 발생합니다
- **가격 형식**: 숫자만 입력하세요 (예: 50000)
- **카테고리**: 소문자로 입력하는 것을 권장합니다 (예: electronics, clothing)

---

## ❓ 문제 해결

**Q: "Slug가 이미 사용 중" 에러가 나요**
- A: 다른 slug를 사용하거나 slug 필드를 비워두세요 (자동 생성됨)

**Q: 상품이 목록에 안 보여요**
- A: `is_active`가 `true`인지 확인하고, `/products` 페이지를 새로고침하세요

**Q: SQL 실행이 안 돼요**
- A: Supabase 프로젝트가 올바르게 연결되어 있는지 확인하세요

