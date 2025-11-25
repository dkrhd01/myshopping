"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/navbar/cart-button";
import { MiniSearchBar } from "@/components/navbar/mini-search-bar";
import { Home, Edit3 } from "lucide-react";

const Navbar = () => {
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* 로고 영역 */}
        <div className="relative flex justify-center py-6 border-b">
          {/* 우측 상단: 로그인/사용자 + 장바구니 */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {hasClerkKey ? (
              <>
                <SignedIn>
                  <CartButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="sm">로그인</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href="/sign-in">로그인</Link>
              </Button>
            )}
          </div>

          {/* 중앙: 로고 */}
          <Link href="/" className="group">
            <div className="relative">
              <span
                className="text-5xl md:text-6xl font-normal tracking-[0.15em] text-foreground group-hover:text-primary transition-colors"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                FAPI
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent group-hover:via-primary/50 transition-colors" />
            </div>
          </Link>
        </div>

        {/* 메인 네비게이션 바 */}
        <div className="flex h-14 items-center justify-between gap-4">
          {/* 좌측 메뉴 */}
          <div className="flex items-center gap-2">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Home className="h-4 w-4 mr-2" />
                상품 목록
              </Button>
            </Link>
            <Link href="/?edit=true">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Edit3 className="h-4 w-4 mr-2" />
                편집 모드
              </Button>
            </Link>
          </div>

          {/* 중앙 카테고리 네비게이션 */}
          <nav className="flex-1 flex items-center justify-center gap-6">
            <Link
              href="/products"
              className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              전체 상품
            </Link>
            <Link
              href="/products?category=의류"
              className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              의류
            </Link>
            <Link
              href="/products?category=전자제품"
              className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              전자제품
            </Link>
            <Link
              href="/products?category=신발"
              className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              신발
            </Link>
            <Link
              href="/products?category=액세서리"
              className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              액세서리
            </Link>
          </nav>

          {/* 우측 메뉴: 검색 아이콘 */}
          <div className="flex items-center gap-2">
            <MiniSearchBar />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
