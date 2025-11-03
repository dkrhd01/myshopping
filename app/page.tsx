import Link from "next/link";
import { Flame, LayoutGrid, Sparkles } from "lucide-react";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/home/product-card";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  inventory_quantity: number;
  is_active: boolean;
  created_at: string;
};

type HomePageData = {
  latestProducts: Product[];
  popularProducts: Product[];
  categories: { name: string; productCount: number }[];
};

async function getHomePageData(): Promise<HomePageData> {
  try {
    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, description, price, currency, category, inventory_quantity, is_active, created_at",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(36);

    if (error) {
      throw error;
    }

    const products = data ?? [];

    console.info("[HomePage] fetched active products", {
      total: products.length,
    });

    const categoriesMap = products.reduce<Map<string, number>>((acc, product) => {
      if (!product.category) {
        return acc;
      }
      acc.set(product.category, (acc.get(product.category) ?? 0) + 1);
      return acc;
    }, new Map());

    const categories = Array.from(categoriesMap.entries())
      .map(([name, productCount]) => ({ name, productCount }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 8);

    console.info("[HomePage] derived categories", {
      total: categories.length,
    });

    const popularProducts = [...products]
      .sort((a, b) => b.inventory_quantity - a.inventory_quantity)
      .slice(0, 4);

    console.info("[HomePage] derived popular products", {
      total: popularProducts.length,
    });

    const latestProducts = products.slice(0, 8);

    return {
      latestProducts,
      popularProducts,
      categories,
    };
  } catch (error) {
    console.error("[HomePage] failed to load data", error);
    return {
      latestProducts: [],
      popularProducts: [],
      categories: [],
    };
  }
}

export default async function Home() {
  const { latestProducts, popularProducts, categories } = await getHomePageData();

  return (
    <main className="bg-gradient-to-b from-blue-50/60 via-white to-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" aria-hidden />
              Next.js · Clerk · Supabase 템플릿
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              모던 커머스 경험을 위한 스타터 키트
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              실시간 인증, 서버 액션, RLS 기반 데이터까지 바로 사용할 수 있는
              인프라를 제공합니다. 홈 화면에서 상품과 카테고리를 확인해 보세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/products">전체 상품 보기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">통합 가이드 살펴보기</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 rounded-3xl border bg-white/70 p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" aria-hidden />
              <h2 className="text-xl font-semibold">빠르게 살펴보기</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Supabase Storage 업로드, Clerk 인증 테스트 페이지로 이동해 실제 플로우를 체험해 보세요.
            </p>
            <div className="flex flex-col gap-4">
              <Button variant="secondary" asChild className="justify-between">
                <Link href="/storage-test">
                  Storage 업로드 테스트
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-between">
                <Link href="/auth-test">
                  Clerk + Supabase 인증 연동
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">신규 상품</h2>
              <p className="text-sm text-muted-foreground">
                가장 최근에 등록된 활성 상품을 확인해 보세요.
              </p>
            </div>
            <Button variant="link" asChild>
              <Link href="/products" className="text-sm font-medium">
                전체 보기
              </Link>
            </Button>
          </div>

          {latestProducts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-white/60 p-10 text-center text-muted-foreground">
              신규 상품 정보가 아직 준비되지 않았습니다.
            </div>
          )}
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-6 w-6 text-primary" aria-hidden />
              <div>
                <h2 className="text-2xl font-semibold">카테고리 탐색</h2>
                <p className="text-sm text-muted-foreground">
                  가장 인기 있는 카테고리부터 빠르게 이동할 수 있습니다.
                </p>
              </div>
            </div>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant="outline"
                    asChild
                    className="rounded-full border-primary/30 px-5"
                  >
                    <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                      {category.name} · {category.productCount}
                    </Link>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-white/60 p-8 text-sm text-muted-foreground">
                표시할 카테고리가 아직 없습니다. 상품을 추가하면 자동으로 노출됩니다.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-primary" aria-hidden />
              <div>
                <h2 className="text-2xl font-semibold">인기 상품</h2>
                <p className="text-sm text-muted-foreground">
                  높은 재고 회전을 보이는 상품을 하이라이트로 보여줍니다.
                </p>
              </div>
            </div>
            {popularProducts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {popularProducts.map((product) => (
                  <ProductCard key={product.id} product={product} highlight />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-white/60 p-8 text-sm text-muted-foreground">
                인기 상품 데이터가 준비되면 이곳에 표시됩니다.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
