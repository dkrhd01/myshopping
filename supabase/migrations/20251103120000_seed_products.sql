INSERT INTO public.products (name, slug, description, price, currency, category, inventory_quantity, is_active)
VALUES
  (
    '무선 노이즈 캔슬링 헤드폰',
    'wireless-noise-cancelling-headphones',
    '하루 종일 착용해도 편안한 프리미엄 헤드폰으로 몰입감 있는 사운드를 즐겨보세요.',
    289000,
    'KRW',
    'electronics',
    45,
    true
  ),
  (
    'USB-C 멀티 포트 허브 8-in-1',
    'usb-c-multiport-hub-8-in-1',
    '고속 데이터 전송과 4K HDMI를 지원하는 올인원 허브입니다.',
    89000,
    'KRW',
    'gadgets',
    120,
    true
  ),
  (
    '프리미엄 유기농 콜드브루 세트',
    'premium-organic-coldbrew-set',
    '산미와 바디감이 뛰어난 3종 원두로 구성된 콜드브루 패키지입니다.',
    39000,
    'KRW',
    'food',
    80,
    true
  ),
  (
    '테라피 아로마 디퓨저 라이트',
    'therapy-aroma-diffuser-light',
    '7가지 무드조명이 있는 초음파 방식 디퓨저로 공간을 향기롭게 연출합니다.',
    49000,
    'KRW',
    'home',
    65,
    true
  ),
  (
    '모달 코튼 루즈핏 셔츠',
    'modal-cotton-relaxed-shirt',
    '모달과 코튼 혼방으로 제작된 부드러운 촉감의 데일리 셔츠입니다.',
    59000,
    'KRW',
    'clothing',
    150,
    true
  ),
  (
    '탄력 케어 비타민C 세럼',
    'vitamin-c-brightening-serum',
    '저자극 처방으로 피부 탄력과 톤을 동시에 케어하는 고농축 세럼입니다.',
    32000,
    'KRW',
    'beauty',
    110,
    true
  ),
  (
    '폼롤러 & 마사지볼 웰니스 세트',
    'foam-roller-massage-ball-set',
    '스트레칭과 근육 이완에 도움을 주는 웰니스 홈트 세트입니다.',
    45000,
    'KRW',
    'wellness',
    95,
    true
  ),
  (
    '데일리 생산성 플래너',
    'daily-productivity-planner',
    '하루를 구조화하여 기록할 수 있는 하드커버 플래너로 목표 관리에 효과적입니다.',
    18000,
    'KRW',
    'lifestyle',
    200,
    true
  ),
  (
    'AI 시대의 비즈니스 전략',
    'business-strategy-in-ai-era',
    'AI 트렌드에 맞춘 조직 운영과 성장 전략을 제시하는 비즈니스 참고서입니다.',
    28000,
    'KRW',
    'books',
    70,
    true
  ),
  (
    '프리미엄 요가매트 8mm',
    'premium-yoga-mat-8mm',
    '미끄럼 방지 처리와 쿠션감을 강화한 홈트 전용 요가매트입니다.',
    38000,
    'KRW',
    'sports',
    130,
    true
  )
ON CONFLICT (slug) DO NOTHING;

