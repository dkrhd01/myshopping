import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CheckoutCompletePageProps {
  searchParams: Promise<{ orderId?: string; payment?: string; paymentKey?: string; reason?: string; message?: string }>;
}

export default async function CheckoutCompletePage({ searchParams }: CheckoutCompletePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/checkout/complete");
  }

  const params = await searchParams;
  const orderId = params.orderId;
  const paymentStatus = params.payment ?? "pending";
  const paymentMessage = params.message ?? "";
  const failureReason = params.reason ?? "";

  if (!orderId) {
    redirect("/products");
  }

  const supabase = createClerkSupabaseClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, total_amount, currency, status, placed_at, shipping_name, shipping_phone, shipping_postal_code, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_country, order_note, order_items:order_items(product_name, quantity, unit_price, line_total)",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order || order.user_id === null) {
    redirect("/products");
  }

  const orderOwnerId = order.user_id as string;

  const { data: userRow } = await supabase
    .from("users")
    .select("id, clerk_id")
    .eq("id", orderOwnerId)
    .maybeSingle();

  if (!userRow || userRow.clerk_id !== userId) {
    redirect("/products");
  }

  return (
    <main className="bg-gradient-to-b from-emerald-50 via-white to-white">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {paymentStatus === "success" ? "결제가 완료되었습니다." : paymentStatus === "failed" ? "결제가 완료되지 않았습니다." : "주문이 접수되었습니다."}
          </h1>
          <p className="text-sm text-muted-foreground">
            주문 번호 <span className="font-semibold">{order.id}</span> 로 접수되었습니다.
          </p>
          {paymentStatus === "failed" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <strong>결제 실패:</strong> {paymentMessage || "결제가 취소되었거나 실패했습니다."}
              {failureReason && <div className="mt-1 text-xs">사유 코드: {failureReason}</div>}
            </div>
          )}
          {paymentStatus === "success" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              결제가 정상적으로 완료되었습니다.
            </div>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <section className="space-y-6 rounded-3xl border bg-white p-8 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold">배송 정보</h2>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(order.placed_at as string)} 기준으로 주문이 접수되었습니다.
              </p>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">수령인</dt>
                <dd className="font-medium">{order.shipping_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">연락처</dt>
                <dd className="font-medium">{order.shipping_phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">우편번호</dt>
                <dd className="font-medium">{order.shipping_postal_code}</dd>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  {order.shipping_address_line1}
                  {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""}
                </p>
                <p>
                  {order.shipping_city}
                  {order.shipping_state ? `, ${order.shipping_state}` : ""}, {order.shipping_country}
                </p>
              </div>
              {order.order_note && (
                <div className="rounded-xl bg-muted/20 p-4 text-xs text-muted-foreground">
                  요청사항: {order.order_note}
                </div>
              )}
            </dl>
          </section>

          <aside className="space-y-6 rounded-3xl border bg-white p-8 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold">결제 정보</h3>
              <p className="text-sm text-muted-foreground">주문 금액과 상태를 확인하세요.</p>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">총 결제 금액</dt>
                <dd className="font-semibold">
                  {formatCurrency(Number(order.total_amount ?? 0), order.currency ?? "KRW")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">주문 상태</dt>
                <dd className="font-medium capitalize">{order.status}</dd>
              </div>
            </dl>
            {paymentStatus !== "success" && (
              <p className="text-xs text-muted-foreground">
                결제가 완료되어야 주문이 확정됩니다. 결제 실패 시 아래 버튼을 통해 다시 시도하세요.
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/products">다른 상품 둘러보기</Link>
              </Button>
              {paymentStatus !== "success" && (
                <Button variant="outline" asChild>
                  <Link href={`/checkout/pay?orderId=${order.id}`}>결제 다시 시도하기</Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/cart">장바구니로 돌아가기</Link>
              </Button>
            </div>
          </aside>
        </div>

        <section className="space-y-4 rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">주문 상품</h2>
          <div className="divide-y">
            {(order.order_items ?? []).map((item, index) => (
              <div key={`${item.product_name}-${index}`} className="grid gap-2 py-4 md:grid-cols-[2fr_auto_auto] md:items-center">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">수량 {item.quantity}개</p>
                </div>
                <div className="text-sm text-muted-foreground md:text-right">
                  단가 {formatCurrency(Number(item.unit_price ?? 0), order.currency ?? "KRW")}
                </div>
                <div className="text-sm font-semibold md:text-right">
                  {formatCurrency(Number(item.line_total ?? 0), order.currency ?? "KRW")}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

