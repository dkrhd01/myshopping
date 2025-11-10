"use client";

/**
 * @file add-to-cart-button.tsx
 * @description 상품 상세 페이지에서 장바구니 담기 버튼을 제공하는 컴포넌트
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { addToCartAction } from "@/actions/cart";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAddToCart() {
    startTransition(async () => {
      const result = await addToCartAction({ productId, quantity: 1 });
      setMessage(result.message);
      
      // 성공 시 네비게이션 새로고침하여 장바구니 버튼 업데이트
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="lg"
        className="gap-2"
        onClick={handleAddToCart}
        disabled={disabled || isPending}
      >
        <ShoppingCart className="h-5 w-5" aria-hidden />
        {isPending ? "담는 중..." : "장바구니에 담기"}
      </Button>
      {message && (
        <p className={`text-xs ${message.includes("성공") || message.includes("담았습니다") ? "text-green-600" : "text-muted-foreground"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

