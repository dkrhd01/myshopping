'use server';

/**
 * @file lookbooks.ts
 * @description 룩북 데이터를 가져오는 서버 액션
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";

export interface LookbookProduct {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  position_x: number;
  position_y: number;
}

export interface Lookbook {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  display_order: number;
  products: LookbookProduct[];
}

export async function getActiveLookbooks(): Promise<Lookbook[]> {
  try {
    // Service Role Key를 사용하여 RLS 우회 (공개 데이터이므로)
    let supabase;
    try {
      supabase = getServiceRoleClient();
    } catch (error) {
      console.error("[Lookbooks] Failed to create Supabase client", error);
      // Service Role Key가 없으면 anon key로 시도
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("[Lookbooks] Missing Supabase environment variables", {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        });
        return [];
      }

      const { createClient } = await import("@supabase/supabase-js");
      supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    // 활성 룩북 조회
    const { data: lookbooks, error: lookbooksError } = await supabase
      .from("lookbooks")
      .select("id, title, description, image_url, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (lookbooksError) {
      console.error("[Lookbooks] failed to fetch lookbooks", lookbooksError);
      return [];
    }

    if (!lookbooks || lookbooks.length === 0) {
      return [];
    }

    // 각 룩북의 상품 조회
    const lookbooksWithProducts = await Promise.all(
      lookbooks.map(async (lookbook) => {
        const { data: items, error: itemsError } = await supabase
          .from("lookbook_items")
          .select(
            `
            position_x,
            position_y,
            product:products(
              id,
              name,
              slug,
              price,
              currency,
              image_url
            )
          `,
          )
          .eq("lookbook_id", lookbook.id);

        if (itemsError) {
          console.error(
            `[Lookbooks] failed to fetch items for lookbook ${lookbook.id}`,
            itemsError,
          );
          return {
            ...lookbook,
            products: [],
          };
        }

        const products: LookbookProduct[] = (items ?? [])
          .filter((item: any) => item.product)
          .map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: Number(item.product.price),
            currency: item.product.currency,
            image_url: item.product.image_url,
            position_x: Number(item.position_x),
            position_y: Number(item.position_y),
          }));

        return {
          ...lookbook,
          products,
        };
      }),
    );

    console.info("[Lookbooks] fetched lookbooks with products", {
      count: lookbooksWithProducts.length,
      totalProducts: lookbooksWithProducts.reduce(
        (acc, lb) => acc + lb.products.length,
        0,
      ),
    });

    return lookbooksWithProducts;
  } catch (error) {
    console.error("[Lookbooks] unexpected error", error);
    return [];
  }
}

