/**
 * @file cart.ts
 * @description 장바구니 도메인을 위한 타입 정의
 */

export interface CartProduct {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  currency: string;
  category: string | null;
  inventory_quantity: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct | null;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
  currency: string;
  requiresAuth: boolean;
}

export interface CartActionResult {
  success: boolean;
  message: string;
}

