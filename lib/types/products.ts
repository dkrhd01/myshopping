/**
 * @file products.ts
 * @description 상품 도메인을 위한 공통 타입 선언 모음
 */

export interface ProductRecord {
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
}

export type ProductSortOption = "latest" | "price-asc" | "price-desc";

export interface ProductListQuery {
  page?: number;
  limit?: number;
  category?: string;
  sort?: ProductSortOption;
}

export interface ProductListResult {
  products: ProductRecord[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
  availableCategories: string[];
}

