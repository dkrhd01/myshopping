import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ShoppingCart } from "lucide-react";

import { getCart } from "@/actions/cart";
import { CartClient } from "@/components/cart/cart-client";
import { Button } from "@/components/ui/button";

export default async function CartPage() {
  const { userId } = await auth();
  const cart = await getCart();

  if (!userId) {
    redirect("/sign-in?redirect_url=/cart");
  }

  return (
    <main className="bg-gradient-to-b from-indigo-50 via-white to-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">장바구니</h1>
            <p className="text-sm text-muted-foreground">
              선택한 상품을 확인하고 결제를 진행하세요.
            </p>
          </div>
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/products">
              <ShoppingCart className="h-4 w-4" aria-hidden /> 상품 더 보기
            </Link>
          </Button>
        </header>

        <CartClient cart={cart} />
      </section>
    </main>
  );
}

