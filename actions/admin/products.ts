'use server';

/**
 * @file products.ts
 * @description 관리자 상품 관리 서버 액션
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { createProductSchema, type CreateProductFormValues } from "@/lib/validations/products";

export type CreateProductResult =
  | {
      success: true;
      message: string;
      productId: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

/**
 * 상품 생성 서버 액션
 */
export async function createProductAction(
  input: CreateProductFormValues,
): Promise<CreateProductResult> {
  // 로그인 체크
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 입력 검증
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "입력 정보를 확인해주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = getServiceRoleClient();

    // slug 중복 체크 (slug가 제공된 경우)
    if (parsed.data.slug && parsed.data.slug.trim() !== "") {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", parsed.data.slug)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          message: "이미 사용 중인 slug입니다.",
          fieldErrors: {
            slug: ["이미 사용 중인 slug입니다."],
          },
        };
      }
    }

    // 상품 생성
    const insertData: {
      name: string;
      slug?: string;
      description?: string;
      price: number;
      currency: string;
      category?: string;
      inventory_quantity: number;
      is_active: boolean;
    } = {
      name: parsed.data.name,
      price: parsed.data.price,
      currency: parsed.data.currency,
      inventory_quantity: parsed.data.inventory_quantity,
      is_active: parsed.data.is_active,
    };

    // 옵셔널 필드 추가
    if (parsed.data.slug && parsed.data.slug.trim() !== "") {
      insertData.slug = parsed.data.slug;
    }
    if (parsed.data.description && parsed.data.description.trim() !== "") {
      insertData.description = parsed.data.description;
    }
    if (parsed.data.category && parsed.data.category.trim() !== "") {
      insertData.category = parsed.data.category;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      console.error("[AdminProducts] createProduct failed", error);
      return {
        success: false,
        message: "상품 생성에 실패했습니다. 다시 시도해주세요.",
      };
    }

    console.info("[AdminProducts] product created", {
      productId: product.id,
      name: parsed.data.name,
      is_active: insertData.is_active,
      slug: insertData.slug,
      category: insertData.category,
    });

    // 캐시 무효화
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "상품이 성공적으로 추가되었습니다.",
      productId: product.id,
    };
  } catch (error) {
    console.error("[AdminProducts] unexpected error", error);
    return {
      success: false,
      message: "예상치 못한 오류가 발생했습니다.",
    };
  }
}

