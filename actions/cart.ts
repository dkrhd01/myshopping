'use server';

/**
 * @file cart.ts
 * @description 장바구니 조작을 위한 서버 액션 모음
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  CartActionResult,
  CartSummary,
} from "@/lib/types/cart";

const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const updateQuantitySchema = z.object({
  cartItemId: z.string().uuid(),
  quantity: z.number().int().min(0).max(99),
});

const removeItemSchema = z.object({
  cartItemId: z.string().uuid(),
});

async function getUserContext() {
  const { userId } = await auth();

  if (!userId) {
    return {
      userId: null,
      supabaseUserId: null,
    } as const;
  }

  const supabase = createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[CartActions] failed to load users row", { error, userId });
    throw new Error("사용자 정보를 불러오지 못했습니다.");
  }

  if (!data) {
    console.warn("[CartActions] no supabase user found", { userId });
    throw new Error("사용자 동기화가 필요합니다.");
  }

  return {
    userId,
    supabaseUserId: data.id as string,
  } as const;
}

export async function getCart(): Promise<CartSummary> {
  try {
    const context = await getUserContext();

    if (!context.userId || !context.supabaseUserId) {
      return {
        items: [],
        subtotal: 0,
        totalQuantity: 0,
        currency: "KRW",
        requiresAuth: true,
      };
    }

    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        "id, quantity, product:products(id, name, slug, price, currency, category, inventory_quantity)",
      )
      .eq("user_id", context.supabaseUserId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[CartActions] failed to fetch cart items", error);
      throw new Error("장바구니를 불러오지 못했습니다.");
    }

    const items = (data ?? []).map((item) => {
      const product = item.product
        ? {
            id: item.product.id as string,
            name: item.product.name as string,
            slug: (item.product.slug as string | null) ?? null,
            price: Number(item.product.price ?? 0),
            currency: (item.product.currency as string) ?? "KRW",
            category: (item.product.category as string | null) ?? null,
            inventory_quantity: Number(item.product.inventory_quantity ?? 0),
          }
        : null;

      const lineTotal = product ? product.price * item.quantity : 0;

      return {
        id: item.id as string,
        quantity: item.quantity as number,
        product,
        lineTotal,
      };
    });

    const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const currency = items[0]?.product?.currency ?? "KRW";

    console.info("[CartActions] cart summary", {
      itemCount: items.length,
      subtotal,
      totalQuantity,
    });

    return {
      items,
      subtotal,
      totalQuantity,
      currency,
      requiresAuth: false,
    };
  } catch (error) {
    console.error("[CartActions] getCart failed", error);
    return {
      items: [],
      subtotal: 0,
      totalQuantity: 0,
      currency: "KRW",
      requiresAuth: false,
    };
  }
}

export async function addToCartAction(input: z.infer<typeof addToCartSchema>): Promise<CartActionResult> {
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "유효하지 않은 요청입니다.",
    };
  }

  try {
    const context = await getUserContext();

    if (!context.userId || !context.supabaseUserId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, inventory_quantity, is_active")
      .eq("id", parsed.data.productId)
      .eq("is_active", true)
      .maybeSingle();

    if (productError || !product) {
      console.warn("[CartActions] product not available", {
        error: productError,
        productId: parsed.data.productId,
      });
      return {
        success: false,
        message: "상품을 찾을 수 없습니다.",
      };
    }

    if ((product.inventory_quantity ?? 0) <= 0) {
      return {
        success: false,
        message: "현재 재고가 없습니다.",
      };
    }

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", context.supabaseUserId)
      .eq("product_id", parsed.data.productId)
      .maybeSingle();

    const nextQuantity = Math.min(
      product.inventory_quantity ?? parsed.data.quantity,
      (existingItem?.quantity ?? 0) + parsed.data.quantity,
    );

    if (existingItem) {
      await supabase
        .from("cart_items")
        .update({ quantity: nextQuantity })
        .eq("id", existingItem.id)
        .eq("user_id", context.supabaseUserId);
    } else {
      await supabase.from("cart_items").insert({
        user_id: context.supabaseUserId,
        product_id: parsed.data.productId,
        quantity: nextQuantity,
      });
    }

    console.info("[CartActions] added to cart", {
      userId: context.userId,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    });

    revalidatePath("/cart");
    revalidatePath("/products");

    return {
      success: true,
      message: "장바구니에 담았습니다.",
    };
  } catch (error) {
    console.error("[CartActions] addToCart failed", error);
    return {
      success: false,
      message: "장바구니 추가에 실패했습니다.",
    };
  }
}

export async function updateCartQuantityAction(
  input: z.infer<typeof updateQuantitySchema>,
): Promise<CartActionResult> {
  const parsed = updateQuantitySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "유효하지 않은 요청입니다.",
    };
  }

  try {
    const context = await getUserContext();

    if (!context.userId || !context.supabaseUserId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    const { data: cartItem, error: cartItemError } = await supabase
      .from("cart_items")
      .select("id, quantity, product_id, product:products(inventory_quantity)")
      .eq("id", parsed.data.cartItemId)
      .eq("user_id", context.supabaseUserId)
      .maybeSingle();

    if (cartItemError || !cartItem) {
      console.warn("[CartActions] cart item not found", {
        error: cartItemError,
        cartItemId: parsed.data.cartItemId,
      });
      return {
        success: false,
        message: "장바구니 항목을 찾을 수 없습니다.",
      };
    }

    if (parsed.data.quantity <= 0) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("id", parsed.data.cartItemId)
        .eq("user_id", context.supabaseUserId);

      console.info("[CartActions] removed item via quantity 0", parsed.data.cartItemId);
      revalidatePath("/cart");
      return {
        success: true,
        message: "장바구니에서 제거했습니다.",
      };
    }

    const maxQuantity = Number(cartItem.product?.inventory_quantity ?? 0);

    if (maxQuantity <= 0) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("id", parsed.data.cartItemId)
        .eq("user_id", context.supabaseUserId);

      return {
        success: false,
        message: "재고가 없어 장바구니에서 제거되었습니다.",
      };
    }

    const nextQuantity = Math.min(parsed.data.quantity, maxQuantity);

    await supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", parsed.data.cartItemId)
      .eq("user_id", context.supabaseUserId);

    console.info("[CartActions] updated quantity", {
      cartItemId: parsed.data.cartItemId,
      quantity: nextQuantity,
    });

    revalidatePath("/cart");

    return {
      success: true,
      message: "수량이 업데이트되었습니다.",
    };
  } catch (error) {
    console.error("[CartActions] update quantity failed", error);
    return {
      success: false,
      message: "수량 변경에 실패했습니다.",
    };
  }
}

export async function removeCartItemAction(
  input: z.infer<typeof removeItemSchema>,
): Promise<CartActionResult> {
  const parsed = removeItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "유효하지 않은 요청입니다.",
    };
  }

  try {
    const context = await getUserContext();

    if (!context.userId || !context.supabaseUserId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    await supabase
      .from("cart_items")
      .delete()
      .eq("id", parsed.data.cartItemId)
      .eq("user_id", context.supabaseUserId);

    console.info("[CartActions] removed cart item", parsed.data.cartItemId);

    revalidatePath("/cart");

    return {
      success: true,
      message: "장바구니에서 제거했습니다.",
    };
  } catch (error) {
    console.error("[CartActions] remove failed", error);
    return {
      success: false,
      message: "장바구니 제거에 실패했습니다.",
    };
  }
}

