"use client";

/**
 * @file cart-button.tsx
 * @description 네비게이션에 표시되는 장바구니 버튼 (클라이언트 컴포넌트)
 * 새로 담긴 아이템 개수를 플로팅 애니메이션으로 표시합니다.
 */

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCart } from "@/actions/cart";

export function CartButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [previousCount, setPreviousCount] = useState(0);
  const [showFloatingCount, setShowFloatingCount] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 초기 로드 및 경로 변경 시 장바구니 개수 로드
  useEffect(() => {
    async function loadCart() {
      startTransition(async () => {
        const cart = await getCart();
        const newCount = cart.totalQuantity;
        const oldCount = cartCount;
        
        // 이전 개수와 비교하여 증가했을 때만 플로팅 표시
        if (newCount > oldCount && oldCount > 0) {
          setShowFloatingCount(true);
          setTimeout(() => setShowFloatingCount(false), 2000); // 2초 후 자동 숨김
        }
        
        setCartCount(newCount);
        setPreviousCount(oldCount);
      });
    }
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // pathname 변경 시만 새로고침

  return (
    <Button variant="outline" size="icon" asChild className="relative h-9 w-9" disabled={isPending}>
      <Link href="/cart" aria-label="장바구니">
        <ShoppingCart className="h-4 w-4" aria-hidden />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
        {showFloatingCount && cartCount > previousCount && (
          <span className="absolute -right-1 -top-8 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white animate-bounce shadow-lg z-50">
            +{cartCount - previousCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
