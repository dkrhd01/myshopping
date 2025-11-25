
/**
 * 환경 변수 확인 페이지 (디버깅용)
 * 프로덕션에서도 확인 가능하도록 서버 컴포넌트로 작성
 */
export default async function EnvDebugPage() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerkSecret = !!process.env.CLERK_SECRET_KEY;

  // URL과 키의 일부만 표시 (보안)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...`
    : "없음";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
    : "없음";

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">환경 변수 확인</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Supabase 설정</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <span className={hasSupabaseUrl ? "text-green-600" : "text-red-600"}>
                {hasSupabaseUrl ? "✓" : "✗"}
              </span>{" "}
              NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl}
            </li>
            <li>
              <span className={hasSupabaseKey ? "text-green-600" : "text-red-600"}>
                {hasSupabaseKey ? "✓" : "✗"}
              </span>{" "}
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {supabaseKey}
            </li>
          </ul>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Clerk 설정</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <span className={hasClerkKey ? "text-green-600" : "text-red-600"}>
                {hasClerkKey ? "✓" : "✗"}
              </span>{" "}
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {hasClerkKey ? "설정됨" : "없음"}
            </li>
            <li>
              <span className={hasClerkSecret ? "text-green-600" : "text-red-600"}>
                {hasClerkSecret ? "✓" : "✗"}
              </span>{" "}
              CLERK_SECRET_KEY: {hasClerkSecret ? "설정됨" : "없음"}
            </li>
          </ul>
        </div>

        {(!hasSupabaseUrl || !hasSupabaseKey) && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 경고</h3>
            <p className="text-sm text-yellow-700">
              Supabase 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 환경 변수를 확인해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

