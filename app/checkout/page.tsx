import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getCart } from "@/actions/cart";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default async function CheckoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/checkout");
  }

  const cart = await getCart();

  if (cart.items.length === 0) {
    redirect("/cart?empty=1");
  }

  return (
    <main className="bg-gradient-to-b from-rose-50 via-white to-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">주문 정보 입력</h1>
          <p className="text-sm text-muted-foreground">
            배송지를 입력하고 결제 단계를 진행하세요.
          </p>
        </header>

        <CheckoutForm cart={cart} />
      </section>
    </main>
  );
}

