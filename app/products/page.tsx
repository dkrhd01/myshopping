import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { cn, formatCurrency } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import type {
  ProductListQuery,
  ProductListResult,
  ProductSortOption,
} from "@/lib/types/products";
import { ProductCard } from "@/components/home/product-card";
import { Button } from "@/components/ui/button";
import { SortSelect } from "@/components/products/sort-select";
import { ArrowLeft, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<ProductListQuery>;
}

const PER_PAGE_DEFAULT = 12;
const PER_PAGE_MAX = 24;
const SORT_OPTIONS: Record<ProductSortOption, string> = {
  latest: "최신순",
  "price-asc": "낮은 가격순",
  "price-desc": "높은 가격순",
};

async function fetchProductList(
  searchParams: ProductListQuery,
): Promise<ProductListResult> {
  // 공개 데이터이므로 anon key 사용 (RLS 비활성화 상태)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[ProductsPage] Missing Supabase environment variables");
    return {
      products: [],
      total: 0,
      page: 1,
      limit: PER_PAGE_DEFAULT,
      pageCount: 0,
      availableCategories: [],
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const limit = Math.min(
    PER_PAGE_MAX,
    Math.max(1, Number(searchParams.limit ?? PER_PAGE_DEFAULT)),
  );
  const category = searchParams.category?.trim();
  const sort = searchParams.sort ?? "latest";
  const search = searchParams.search?.trim();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, description, price, currency, category, inventory_quantity, is_active, created_at, image_url",
      { count: "exact" },
    )
    .eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  // 검색 기능: 이름이나 설명에서 검색
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "latest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[ProductsPage] failed to fetch products", {
      error,
      searchParams,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
    });
    // 에러 발생 시 빈 배열 반환 (페이지는 렌더링됨)
    return {
      products: [],
      total: 0,
      page,
      limit,
      pageCount: 0,
      availableCategories: [],
    };
  }

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null)
    .eq("is_active", true)
    .order("category", { ascending: true })
    .limit(100);

  if (categoriesError) {
    console.error("[ProductsPage] failed to fetch categories", categoriesError);
  }

  const availableCategories = (categoriesData ?? [])
    .map((item) => item.category as string)
    .filter(Boolean);

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  console.info("[ProductsPage] fetched listing", {
    page,
    limit,
    total,
    pageCount,
    category,
    sort,
    productCount: data?.length ?? 0,
    products: data?.map((p) => ({ id: p.id, name: p.name, is_active: p.is_active })),
  });

  return {
    products: data ?? [],
    total,
    page,
    limit,
    pageCount,
    availableCategories,
  };
}

function getPaginationLinks({
  page,
  pageCount,
  searchParams,
}: {
  page: number;
  pageCount: number;
  searchParams: ProductListQuery;
}) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.limit) params.set("limit", String(searchParams.limit));
  if (searchParams.search) params.set("search", searchParams.search);

  const makeLink = (targetPage: number) => {
    const nextParams = new URLSearchParams(params.toString());
    nextParams.set("page", String(targetPage));
    return `/products?${nextParams.toString()}`;
  };

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return {
    prev: page > 1 ? makeLink(page - 1) : null,
    next: page < pageCount ? makeLink(page + 1) : null,
    pages: pages.map((number) => ({
      number,
      href: makeLink(number),
      isActive: number === page,
    })),
  };
}

// buildSortLink 함수는 더 이상 사용하지 않음 (SortSelect 컴포넌트로 대체)

function buildCategoryLink(category: string | null, searchParams: ProductListQuery) {
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.limit) params.set("limit", String(searchParams.limit));
  if (searchParams.search) params.set("search", searchParams.search);
  params.delete("page");
  const queryString = params.toString();
  return queryString ? `/products?${queryString}` : "/products";
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;
  const result = await fetchProductList(searchParams);

  if (!result) {
    notFound();
  }

  const pagination = getPaginationLinks({
    page: result.page,
    pageCount: result.pageCount,
    searchParams,
  });

  const activeSort = searchParams.sort ?? "latest";
  const activeCategory = searchParams.category ?? null;

  return (
    <main className="bg-background">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">
              {searchParams.search ? `"${searchParams.search}" 검색 결과` : "상품 목록"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {searchParams.search
                ? `총 ${result.total.toLocaleString("ko-KR")}개의 검색 결과`
                : `총 ${result.total.toLocaleString("ko-KR")}개의 상품을 확인할 수 있습니다.`}
            </p>
          </div>
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_2.2fr]">
          <aside className="flex flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="text-lg font-medium">카테고리</h2>
            </div>
            <nav className="flex flex-col gap-2">
              <Button
                variant={activeCategory ? "ghost" : "secondary"}
                asChild
                className={cn("justify-start", !activeCategory && "font-semibold")}
              >
                <Link href={buildCategoryLink(null, searchParams)}>전체 상품</Link>
              </Button>
              {result.availableCategories.length > 0 ? (
                result.availableCategories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "secondary" : "ghost"}
                    asChild
                    className={cn(
                      "justify-start",
                      activeCategory === category && "font-semibold",
                    )}
                  >
                    <Link href={buildCategoryLink(category, searchParams)}>
                      {category}
                    </Link>
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  카테고리가 아직 등록되지 않았습니다.
                </p>
              )}
            </nav>
          </aside>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm text-muted-foreground">
                {result.total > 0
                  ? `${result.total.toLocaleString("ko-KR")}개의 상품`
                  : "상품이 없습니다."}
              </div>
              <div className="flex items-center gap-3">
                <SortSelect defaultValue={activeSort} />
              </div>
            </div>

            <Suspense fallback={<div className="rounded-2xl border bg-white p-10">로딩 중...</div>}>
              {result.products.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {result.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">
                  선택한 조건에 해당하는 상품이 없습니다.
                </div>
              )}
            </Suspense>

            {result.pageCount > 1 && (
              <nav className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-4 text-sm shadow-sm">
                <div className="text-muted-foreground">
                  {result.page} / {result.pageCount} 페이지
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" disabled={!pagination.prev} asChild>
                    <Link href={pagination.prev ?? "#"} aria-disabled={!pagination.prev}>
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  {pagination.pages.map(({ number, href, isActive }) => (
                    <Button
                      key={number}
                      variant={isActive ? "secondary" : "ghost"}
                      size="icon"
                      asChild
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Link href={href}>{number}</Link>
                    </Button>
                  ))}
                  <Button variant="ghost" size="icon" disabled={!pagination.next} asChild>
                    <Link href={pagination.next ?? "#"} aria-disabled={!pagination.next}>
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </nav>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

