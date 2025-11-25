// 이 페이지는 Clerk 인증이 필요한 페이지이므로 동적 렌더링으로 설정
export const dynamic = 'force-dynamic';

export default function CartDebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

