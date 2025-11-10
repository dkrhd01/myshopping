import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Layers3, LayoutGrid, Package } from "lucide-react";

import { createClient } from "@supabase/supabase-js";
import type { ProductRecord } from "@/lib/types/products";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { ProductCard } from "@/components/home/product-card";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

interface ProductDetail extends ProductRecord {
  image_url: string | null;
  relatedProducts: ProductRecord[];
}

async function fetchProductDetail(slugOrId: string): Promise<ProductDetail | null> {
  try {
    // 공개 데이터이므로 anon key 사용 (RLS 비활성화 상태)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // slug 또는 id로 상품 조회
    let query = supabase
      .from("products")
      .select(
        "id, name, slug, description, price, currency, category, inventory_quantity, is_active, created_at, image_url",
      )
      .eq("is_active", true);

    // UUID 형식인지 확인 (UUID는 36자이고 하이픈 포함)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    
    if (isUuid) {
      // ID로 조회
      query = query.eq("id", slugOrId);
    } else {
      // Slug로 조회
      query = query.eq("slug", slugOrId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[ProductDetail] failed to fetch product", { error, slugOrId });
      return null;
    }

    if (!data) {
      return null;
    }

    const { data: relatedProducts, error: relatedError } = await supabase
      .from("products")
      .select(
        "id, name, slug, description, price, currency, category, inventory_quantity, is_active, created_at, image_url",
      )
      .eq("is_active", true)
      .eq("category", data.category)
      .neq("id", data.id)
      .order("created_at", { ascending: false })
      .limit(4);

    if (relatedError) {
      console.warn("[ProductDetail] failed to load related products", relatedError);
    }

    console.info("[ProductDetail] loaded product", {
      id: data.id,
      slug: data.slug,
      category: data.category,
      relatedCount: relatedProducts?.length ?? 0,
    });

    return {
      ...data,
      relatedProducts: relatedProducts ?? [],
    };
  } catch (error) {
    console.error("[ProductDetail] unexpected error", error);
    return null;
  }
}

function getStockStatus(quantity: number) {
  if (quantity <= 0) {
    return { label: "일시 품절", tone: "bg-red-100 text-red-600" };
  }
  if (quantity < 5) {
    return { label: "품절 임박", tone: "bg-amber-100 text-amber-700" };
  }
  return { label: "재고 있음", tone: "bg-emerald-100 text-emerald-700" };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductDetail(slug);

  if (!product) {
    notFound();
  }

  const stockStatus = getStockStatus(product.inventory_quantity);

  return (
    <main className="bg-gradient-to-b from-slate-50 via-white to-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" aria-hidden /> 전체 상품으로 돌아가기
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {product.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary">
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                  {product.category}
                </span>
              )}
              <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium", stockStatus.tone)}>
                <Package className="h-4 w-4" aria-hidden />
                {stockStatus.label}
              </span>
              <span>등록일 {formatDateTime(product.created_at)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(product.price, product.currency)}
            </div>
            <AddToCartButton
              productId={product.id}
              disabled={product.inventory_quantity <= 0}
            />
          </div>
        </header>

        {/* 상품 이미지 */}
        {product.image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
        )}

        <section className="grid gap-8 rounded-3xl border bg-white p-10 shadow-xl md:grid-cols-[1.4fr_1fr]">
          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">상품 설명</h2>
            <p className="leading-relaxed text-muted-foreground">
              {product.description ?? "이 상품에 대한 상세 설명이 곧 업데이트될 예정입니다."}
            </p>
          </article>

          <aside className="space-y-6 rounded-2xl border bg-muted/20 p-6">
            <h3 className="flex items-center gap-2 text-lg font-medium">
              <Layers3 className="h-5 w-5 text-primary" aria-hidden /> 상품 정보
            </h3>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">상품 ID</dt>
                <dd className="font-medium">{product.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">가격</dt>
                <dd className="font-medium">{formatCurrency(product.price, product.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">재고 수량</dt>
                <dd className="font-medium">{product.inventory_quantity.toLocaleString("ko-KR")}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">통화</dt>
                <dd className="font-medium">{product.currency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">카테고리</dt>
                <dd className="font-medium">{product.category ?? "미지정"}</dd>
              </div>
            </dl>
          </aside>
        </section>

        {product.relatedProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">관련 상품</h2>
              <Button variant="link" asChild>
                <Link href={`/products?category=${encodeURIComponent(product.category ?? "")}`}>
                  동일 카테고리 더 보기
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {product.relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

