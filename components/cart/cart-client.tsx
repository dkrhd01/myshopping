"use client";

/**
 * @file cart-client.tsx
 * @description 장바구니 페이지의 클라이언트 상호작용 컴포넌트
 */

import { useTransition } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import type { CartSummary } from "@/lib/types/cart";
import { formatCurrency } from "@/lib/utils";
import {
  removeCartItemAction,
  updateCartQuantityAction,
} from "@/actions/cart";
import { Button } from "@/components/ui/button";

interface CartClientProps {
  cart: CartSummary;
}

export function CartClient({ cart }: CartClientProps) {
  const [isPending, startTransition] = useTransition();

  async function handleChangeQuantity(cartItemId: string, next: number) {
    startTransition(async () => {
      await updateCartQuantityAction({ cartItemId, quantity: next });
    });
  }

  async function handleRemove(cartItemId: string) {
    startTransition(async () => {
      await removeCartItemAction({ cartItemId });
    });
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed bg-muted/20 p-12 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" aria-hidden />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">장바구니가 비었습니다</h2>
          <p className="text-sm text-muted-foreground">
            마음에 드는 상품을 담아보세요. 언제든 주문하실 수 있습니다.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/products">상품 둘러보기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-6">
        {cart.items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-col gap-2">
              <Link
                href={item.product?.slug ? `/products/${item.product.slug}` : `/products/${item.product?.id}`}
                className="text-lg font-semibold hover:underline"
              >
                {item.product?.name ?? "삭제된 상품"}
              </Link>
              <div className="text-sm text-muted-foreground">
                {item.product ? formatCurrency(item.product.price, item.product.currency) : "가격 정보 없음"}
              </div>
              {item.product && item.product.category && (
                <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  {item.product.category}
                </span>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleChangeQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </Button>
                <span className="min-w-[2rem] text-center text-sm font-semibold">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={
                    isPending || (item.product && item.quantity >= item.product.inventory_quantity)
                  }
                  onClick={() => handleChangeQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(item.lineTotal, item.product?.currency ?? cart.currency)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                disabled={isPending}
                onClick={() => handleRemove(item.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden /> 제거
              </Button>
            </div>
          </article>
        ))}
      </section>

      <aside className="flex h-fit flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">주문 요약</h2>
          <p className="text-sm text-muted-foreground">주문 전 수량과 상품을 한 번 더 확인하세요.</p>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">상품 수량</dt>
            <dd className="font-medium">{cart.totalQuantity.toLocaleString("ko-KR")}개</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">상품 합계</dt>
            <dd className="font-semibold">
              {formatCurrency(cart.subtotal, cart.currency)}
            </dd>
          </div>
        </dl>
        <Button asChild size="lg" disabled={isPending}>
          <Link href="/checkout">결제 진행하기</Link>
        </Button>
      </aside>
    </div>
  );
}

