/**
 * @file checkout.ts
 * @description 체크아웃 폼 검증 스키마 정의
 */

import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "이름은 2글자 이상이어야 합니다.")
    .max(60, "이름은 60자 이하로 입력해주세요."),
  phone: z
    .string()
    .trim()
    .min(7, "연락처를 입력해주세요.")
    .max(20, "연락처 형식을 확인해주세요."),
  postalCode: z
    .string()
    .trim()
    .min(3, "우편번호를 입력해주세요.")
    .max(10, "우편번호는 10자 이하로 입력해주세요."),
  addressLine1: z
    .string()
    .trim()
    .min(5, "상세 주소를 입력해주세요."),
  addressLine2: z
    .string()
    .trim()
    .optional(),
  city: z
    .string()
    .trim()
    .min(2, "도시 정보를 입력해주세요."),
  state: z
    .string()
    .trim()
    .optional(),
  country: z
    .string()
    .trim()
    .min(2, "국가를 입력해주세요."),
  orderNote: z
    .string()
    .trim()
    .max(300, "요청사항은 300자 이하로 입력해주세요.")
    .optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

