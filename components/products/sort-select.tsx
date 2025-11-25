"use client";

/**
 * @file sort-select.tsx
 * @description 상품 정렬 선택 컴포넌트 (클라이언트 컴포넌트)
 */

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSortOption } from "@/lib/types/products";

const SORT_OPTIONS: Record<ProductSortOption, string> = {
  latest: "최신순",
  "price-asc": "낮은 가격순",
  "price-desc": "높은 가격순",
};

interface SortSelectProps {
  defaultValue?: ProductSortOption;
}

export function SortSelect({ defaultValue = "latest" }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleValueChange(value: ProductSortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    if (searchParams.get("category")) {
      params.set("category", searchParams.get("category")!);
    }
    if (searchParams.get("limit")) {
      params.set("limit", searchParams.get("limit")!);
    }
    router.push(`/products?${params.toString()}`);
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="정렬" />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(SORT_OPTIONS) as ProductSortOption[]).map((option) => (
          <SelectItem key={option} value={option}>
            {SORT_OPTIONS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

