/**
 * @file product-card.tsx
 * @description 홈 화면에서 상품 정보를 보여주는 카드 컴포넌트
 */

import Link from "next/link";
import Image from "next/image";
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
  image_url?: string | null;
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
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-white/60 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg",
        highlight && "border-primary/40 bg-primary/5",
      )}
    >
      {/* 상품 이미지 */}
      <Link href={productHref} className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/30" aria-hidden />
          </div>
        )}
        {product.category && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            {product.category}
          </span>
        )}
      </Link>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-4 p-6">
        <div>
          <h3 className="text-xl font-semibold leading-tight mb-2">{product.name}</h3>
          {product.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">상품 설명이 곧 업데이트될 예정입니다.</p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t pt-4">
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
      </div>
    </article>
  );
}

