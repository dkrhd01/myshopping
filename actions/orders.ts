'use server';

/**
 * @file orders.ts
 * @description 체크아웃 및 주문 관련 서버 액션
 */

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { checkoutSchema } from "@/lib/validations/checkout";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getCart, getUserContext } from "@/actions/cart";

const checkoutInputSchema = checkoutSchema;

export interface CheckoutActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  orderId?: string;
}

export async function submitCheckoutAction(
  input: z.infer<typeof checkoutInputSchema>,
): Promise<CheckoutActionResult> {
  const parsed = checkoutInputSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      message: "입력값을 다시 확인해주세요.",
      fieldErrors,
    };
  }

  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };
  }

  console.group(`[Checkout] submit start - user ${userId}`);

  try {
    const cart = await getCart();

    if (cart.requiresAuth) {
      console.warn("[Checkout] cart requires auth", { userId });
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    if (cart.items.length === 0) {
      console.warn("[Checkout] empty cart", { userId });
      console.groupEnd();
      return {
        success: false,
        message: "장바구니에 상품이 없습니다.",
      };
    }

    const context = await getUserContext();

    if (!context.supabaseUserId) {
      console.groupEnd();
      return {
        success: false,
        message: "사용자 정보를 불러오지 못했습니다.",
      };
    }

    const lines = cart.items.map((item) => {
      if (!item.product) {
        throw new Error(`상품 정보가 존재하지 않는 장바구니 항목: ${item.id}`);
      }

      const unitPrice = Number(item.product.price ?? 0);
      const quantity = item.quantity;
      const lineTotal = unitPrice * quantity;

      return {
        cartItemId: item.id,
        product: item.product,
        quantity,
        unitPrice,
        lineTotal,
      };
    });

    const computedSubtotal = lines.reduce((acc, line) => acc + line.lineTotal, 0);

    if (Math.abs(computedSubtotal - cart.subtotal) > 0.01) {
      console.warn("[Checkout] subtotal mismatch", {
        computedSubtotal,
        cartSubtotal: cart.subtotal,
      });
      console.groupEnd();
      return {
        success: false,
        message: "주문 금액 검증에 실패했습니다. 다시 시도해주세요.",
      };
    }

    const payload: CheckoutFormValues = {
      ...parsed.data,
      addressLine2: parsed.data.addressLine2 ?? "",
      state: parsed.data.state ?? "",
      orderNote: parsed.data.orderNote ?? "",
    };

    console.info("[Checkout] shipping info", payload);

    const supabase = createClerkSupabaseClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(
        {
          user_id: context.supabaseUserId,
          total_amount: computedSubtotal,
          currency: cart.currency,
          status: "pending",
          shipping_name: payload.fullName,
          shipping_phone: payload.phone,
          shipping_postal_code: payload.postalCode,
          shipping_address_line1: payload.addressLine1,
          shipping_address_line2: payload.addressLine2,
          shipping_city: payload.city,
          shipping_state: payload.state,
          shipping_country: payload.country,
          order_note: payload.orderNote,
        },
      )
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[Checkout] order insert failed", orderError);
      console.groupEnd();
      return {
        success: false,
        message: "주문 생성에 실패했습니다.",
      };
    }

    const orderItemsPayload = lines.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      product_name: line.product.name,
      product_sku: null,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      line_total: line.lineTotal,
    }));

    if (orderItemsPayload.length > 0) {
      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (orderItemsError) {
        console.error("[Checkout] order_items insert failed", orderItemsError);
        console.groupEnd();
        return {
          success: false,
          message: "주문 항목 저장에 실패했습니다.",
        };
      }
    }

    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", context.supabaseUserId);

    if (clearCartError) {
      console.warn("[Checkout] failed to clear cart", clearCartError);
    }

    revalidatePath("/cart");
    revalidatePath("/checkout");

    console.info("[Checkout] order completed", {
      orderId: order.id,
      totalAmount: computedSubtotal,
      itemCount: lines.length,
    });

    console.groupEnd();

    return {
      success: true,
      message: "주문이 완료되었습니다.",
      orderId: order.id,
    };
  } catch (error) {
    console.error("[Checkout] submit failed", error);
    console.groupEnd();
    return {
      success: false,
      message: "주문 처리 중 오류가 발생했습니다.",
    };
  }
}

