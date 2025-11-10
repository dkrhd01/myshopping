import { NextResponse } from "next/server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const code = searchParams.get("code") ?? "unknown";
  const message = searchParams.get("message") ?? "";

  if (orderId) {
    const supabase = getServiceRoleClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (error) {
      console.error("[TossFail] failed to mark order cancelled", error);
    }
  }

  const redirectUrl = new URL("/checkout/complete", request.url);
  if (orderId) redirectUrl.searchParams.set("orderId", orderId);
  redirectUrl.searchParams.set("payment", "failed");
  redirectUrl.searchParams.set("reason", code);
  if (message) redirectUrl.searchParams.set("message", message);

  return NextResponse.redirect(redirectUrl);
}

