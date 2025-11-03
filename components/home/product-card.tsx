/**
 * @file product-card.tsx
 * @description 홈 화면에서 상품 정보를 보여주는 카드 컴포넌트
 */

import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ProductSummary {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  inventory_quantity: number;
}

export interface ProductCardProps {
  product: ProductSummary;
  highlight?: boolean;
}

export function ProductCard({ product, highlight = false }: ProductCardProps) {
  const productHref = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;

  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between rounded-2xl border bg-white/60 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg",
        highlight && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          {product.category && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {product.category}
            </span>
          )}
          <h3 className="text-xl font-semibold leading-tight">{product.name}</h3>
        </div>
        <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>

      {product.description ? (
        <p className="mb-6 line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">상품 설명이 곧 업데이트될 예정입니다.</p>
      )}

      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{formatCurrency(product.price, product.currency)}</span>
          <span className="text-xs text-muted-foreground">
            재고 {product.inventory_quantity.toLocaleString("ko-KR")}개
          </span>
        </div>
        <Button asChild variant={highlight ? "default" : "outline"} size="sm">
          <Link href={productHref} className="inline-flex items-center gap-1">
            보기
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </article>
  );
}

