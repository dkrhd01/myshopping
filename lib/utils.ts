/**
 * @file utils.ts
 * @description 공통 유틸리티 함수 모음 (className 병합, 통화 포맷 등)
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = "KRW",
  locale: string = "ko-KR",
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KRW" ? 0 : 2,
    }).format(value);
  } catch (error) {
    console.warn("formatCurrency failed, falling back to raw number", {
      error,
      value,
      currency,
      locale,
    });
    return value.toLocaleString(locale);
  }
}

export function formatDateTime(value: string | Date, locale: string = "ko-KR") {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    console.warn("formatDateTime received invalid date", { value });
    return "알 수 없음";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
