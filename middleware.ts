import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Clerk 키가 없을 때는 기본 미들웨어만 실행
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Clerk 키가 있을 때만 clerkMiddleware 사용
// 키가 없으면 기본 미들웨어 함수 사용
const middlewareHandler = hasClerkKey
  ? clerkMiddleware()
  : async (request: NextRequest) => NextResponse.next();

export default middlewareHandler;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
