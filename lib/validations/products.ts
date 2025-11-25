/**
 * @file products.ts
 * @description 상품 관리 폼 검증 스키마 정의
 */

import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "상품명을 입력해주세요.")
    .max(100, "상품명은 100자 이하로 입력해주세요."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug는 영문 소문자, 숫자, 하이픈만 사용 가능합니다.")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(2000, "상품 설명은 2000자 이하로 입력해주세요.")
    .optional()
    .or(z.literal("")),
  price: z
    .number({
      required_error: "가격을 입력해주세요.",
      invalid_type_error: "가격은 숫자여야 합니다.",
    })
    .min(0, "가격은 0원 이상이어야 합니다.")
    .max(999999999, "가격은 999,999,999원 이하여야 합니다."),
  currency: z
    .string()
    .trim()
    .length(3, "통화 코드는 3자리여야 합니다.")
    .default("KRW"),
  category: z
    .string()
    .trim()
    .max(50, "카테고리는 50자 이하로 입력해주세요.")
    .optional()
    .or(z.literal("")),
  inventory_quantity: z
    .number({
      required_error: "재고 수량을 입력해주세요.",
      invalid_type_error: "재고 수량은 숫자여야 합니다.",
    })
    .int("재고 수량은 정수여야 합니다.")
    .min(0, "재고 수량은 0 이상이어야 합니다.")
    .max(999999, "재고 수량은 999,999개 이하여야 합니다."),
  is_active: z.boolean().default(true),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

