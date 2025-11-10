import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { TossPaymentWidget } from "@/components/payments/toss-payment-widget";
import { formatCurrency } from "@/lib/utils";

interface CheckoutPayPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutPayPage({ searchParams }: CheckoutPayPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/checkout/pay");
  }

  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    redirect("/products");
  }

  const supabase = createClerkSupabaseClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, total_amount, currency, status, shipping_name, order_items:order_items(product_name, quantity)",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    redirect("/products");
  }

  if (order.status !== "pending") {
    redirect(`/checkout/complete?orderId=${order.id}`);
  }

  const { data: owner } = await supabase
    .from("users")
    .select("id, clerk_id")
    .eq("id", order.user_id)
    .maybeSingle();

  if (!owner || owner.clerk_id !== userId) {
    redirect("/products");
  }

  const orderName = order.order_items?.[0]?.product_name
    ? `${order.order_items[0].product_name} 외 ${Math.max((order.order_items?.length ?? 1) - 1, 0)}건`
    : `주문 ${order.id}`;

  const totalAmount = Number(order.total_amount ?? 0);
  const currency = order.currency ?? "KRW";

  return (
    <main className="bg-gradient-to-b from-sky-50 via-white to-white">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground">주문 번호 {order.id}</p>
          <h1 className="text-3xl font-bold tracking-tight">결제 진행</h1>
          <p className="text-sm text-muted-foreground">
            총 결제 금액 {formatCurrency(totalAmount, currency)}을 결제합니다.
          </p>
        </header>

        <TossPaymentWidget
          orderId={order.id}
          orderName={orderName}
          customerKey={owner.id as string}
          amount={totalAmount}
          currency={currency}
          buyerName={order.shipping_name ?? "고객"}
        />
      </section>
    </main>
  );
}

