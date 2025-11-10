'use server';

/**
 * @file cart.ts
 * @description 장바구니 조작을 위한 서버 액션 모음
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
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

export async function getUserContext() {
  try {
    const { userId } = await auth();

    console.group("[CartActions] getUserContext");
    console.log("Clerk userId:", userId);

    if (!userId) {
      console.log("No userId - user not logged in");
      console.groupEnd();
      return {
        userId: null,
        supabaseUserId: null,
      } as const;
    }

    // Service role을 사용하여 users 테이블 조회 (RLS 우회)
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    console.log("Supabase query result:", { data, error });

    if (error) {
      console.error("[CartActions] failed to load users row", { error, userId });
      console.groupEnd();
      return {
        userId: null,
        supabaseUserId: null,
      } as const;
    }

    if (!data) {
      console.warn("[CartActions] no supabase user found - need sync", { userId });
      console.groupEnd();
      return {
        userId: null,
        supabaseUserId: null,
      } as const;
    }

    console.log("User context resolved:", { userId, supabaseUserId: data.id });
    console.groupEnd();

    return {
      userId,
      supabaseUserId: data.id as string,
    } as const;
  } catch (error) {
    console.error("[CartActions] getUserContext error", error);
    return {
      userId: null,
      supabaseUserId: null,
    } as const;
  }
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
      const rawProduct = (item as any).product;
      const productRow = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;

      const product = productRow
        ? {
            id: productRow.id as string,
            name: productRow.name as string,
            slug: (productRow.slug as string | null) ?? null,
            price: Number(productRow.price ?? 0),
            currency: (productRow.currency as string) ?? "KRW",
            category: (productRow.category as string | null) ?? null,
            inventory_quantity: Number(productRow.inventory_quantity ?? 0),
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
    console.error("[CartActions] getCart error", error);
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
  console.group("[CartActions] addToCartAction START");
  console.log("Input:", input);

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Validation failed:", parsed.error);
    console.groupEnd();
    return {
      success: false,
      message: "유효하지 않은 요청입니다.",
    };
  }

  try {
    const context = await getUserContext();
    console.log("User context:", context);

    if (!context.userId || !context.supabaseUserId) {
      console.warn("No user context - user needs to log in or sync");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다. 페이지를 새로고침해주세요.",
      };
    }

    // Service role 클라이언트 사용 (RLS 우회)
    const supabase = getServiceRoleClient();
    console.log("Using service role client");

    // 상품 조회
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, inventory_quantity, is_active")
      .eq("id", parsed.data.productId)
      .eq("is_active", true)
      .maybeSingle();

    console.log("Product query result:", { product, productError });

    if (productError || !product) {
      console.warn("[CartActions] product not available", {
        error: productError,
        productId: parsed.data.productId,
      });
      console.groupEnd();
      return {
        success: false,
        message: "상품을 찾을 수 없습니다.",
      };
    }

    if ((product.inventory_quantity ?? 0) <= 0) {
      console.warn("Product out of stock");
      console.groupEnd();
      return {
        success: false,
        message: "현재 재고가 없습니다.",
      };
    }

    // 기존 장바구니 항목 조회
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", context.supabaseUserId)
      .eq("product_id", parsed.data.productId)
      .maybeSingle();

    console.log("Existing cart item query:", { existingItem, existingError });

    const nextQuantity = Math.min(
      product.inventory_quantity ?? parsed.data.quantity,
      (existingItem?.quantity ?? 0) + parsed.data.quantity,
    );

    console.log("Next quantity:", nextQuantity);

    if (existingItem) {
      console.log("Updating existing cart item");
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: nextQuantity })
        .eq("id", existingItem.id)
        .eq("user_id", context.supabaseUserId);

      if (updateError) {
        console.error("[CartActions] update cart item failed", updateError);
        console.groupEnd();
        return {
          success: false,
          message: `장바구니 업데이트에 실패했습니다. 오류: ${updateError.message}`,
        };
      }
      console.log("Update successful");
    } else {
      console.log("Inserting new cart item");
      const insertData = {
        user_id: context.supabaseUserId,
        product_id: parsed.data.productId,
        quantity: nextQuantity,
      };
      console.log("Insert data:", insertData);

      const { error: insertError } = await supabase
        .from("cart_items")
        .insert(insertData);

      if (insertError) {
        console.error("[CartActions] insert cart item failed", insertError);
        console.groupEnd();
        return {
          success: false,
          message: `장바구니 추가에 실패했습니다. 오류: ${insertError.message}`,
        };
      }
      console.log("Insert successful");
    }

    console.info("[CartActions] added to cart", {
      userId: context.userId,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    });

    revalidatePath("/cart");
    revalidatePath("/products");
    revalidatePath("/"); // 네비게이션 장바구니 버튼 업데이트를 위해

    console.log("Cache revalidated");
    console.groupEnd();

    return {
      success: true,
      message: "장바구니에 담았습니다.",
    };
  } catch (error) {
    console.error("[CartActions] addToCart failed", error);
    console.groupEnd();
    return {
      success: false,
      message: `알 수 없는 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
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

    const rawProduct = (cartItem as any).product;
    const productRow = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
    const maxQuantity = Number(productRow?.inventory_quantity ?? 0);

    if (maxQuantity <= 0) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("id", parsed.data.cartItemId)
        .eq("user_id", context.supabaseUserId);

      console.info("[CartActions] removed item due to no stock", parsed.data.cartItemId);
      revalidatePath("/cart");
      return {
        success: false,
        message: "재고가 없어 장바구니에서 제거했습니다.",
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
      message: "수량을 변경했습니다.",
    };
  } catch (error) {
    console.error("[CartActions] updateQuantity failed", error);
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
    console.error("[CartActions] removeCartItem failed", error);
    return {
      success: false,
      message: "삭제에 실패했습니다.",
    };
  }
}
