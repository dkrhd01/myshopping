import { NextResponse } from "next/server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";

const TOSS_CONFIRM_ENDPOINT = "https://api.tosspayments.com/v1/payments/confirm";

async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    throw new Error("TOSS_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const authHeader = Buffer.from(`${secretKey}:`).toString("base64");

  const response = await fetch(TOSS_CONFIRM_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => undefined);
    throw new Error(`토스 결제 확인 실패: ${JSON.stringify(errorPayload ?? {})}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amountParam = searchParams.get("amount");

  if (!paymentKey || !orderId || !amountParam) {
    const redirectUrl = new URL("/checkout/complete", request.url);
    redirectUrl.searchParams.set("orderId", orderId ?? "");
    redirectUrl.searchParams.set("payment", "failed");
    redirectUrl.searchParams.set("reason", "missing-params");
    return NextResponse.redirect(redirectUrl);
  }

  const amount = Number(amountParam);

  try {
    await confirmPayment(paymentKey, orderId, amount);

    const supabase = getServiceRoleClient();

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (updateError) {
      console.error("[TossSuccess] order update failed", updateError);
      throw new Error("결제 상태 업데이트에 실패했습니다.");
    }

    console.info("[TossSuccess] payment confirmed", {
      orderId,
      paymentKey,
      amount,
    });

    const redirectUrl = new URL("/checkout/complete", request.url);
    redirectUrl.searchParams.set("orderId", orderId);
    redirectUrl.searchParams.set("payment", "success");
    redirectUrl.searchParams.set("paymentKey", paymentKey);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("[TossSuccess] error", error);
    const supabase = getServiceRoleClient();
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    const redirectUrl = new URL("/checkout/complete", request.url);
    redirectUrl.searchParams.set("orderId", orderId);
    redirectUrl.searchParams.set("payment", "failed");
    redirectUrl.searchParams.set("reason", "confirm-error");
    return NextResponse.redirect(redirectUrl);
  }
}

