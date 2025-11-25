import { NextResponse } from "next/server";
import { getActiveLookbooks } from "@/app/actions/lookbooks";

/**
 * 룩북 데이터 디버깅용 API 엔드포인트
 * GET /api/debug/lookbooks
 */
export async function GET() {
  try {
    const lookbooks = await getActiveLookbooks();

    return NextResponse.json({
      success: true,
      count: lookbooks.length,
      lookbooks: lookbooks.map((lb) => ({
        id: lb.id,
        title: lb.title,
        image_url: lb.image_url,
        productsCount: lb.products.length,
        products: lb.products.map((p) => ({
          id: p.id,
          name: p.name,
          image_url: p.image_url,
        })),
      })),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });
  } catch (error) {
    console.error("[Debug Lookbooks] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        environment: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      },
      { status: 500 }
    );
  }
}

