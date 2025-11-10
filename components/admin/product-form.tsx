"use client";

/**
 * @file product-form.tsx
 * @description 관리자 상품 추가/수정 폼 컴포넌트
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  createProductSchema,
  type CreateProductFormValues,
} from "@/lib/validations/products";
import { createProductAction } from "@/actions/admin/products";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  onSuccess?: (productId: string) => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      currency: "KRW",
      category: "",
      inventory_quantity: 0,
      is_active: true,
    },
  });

  async function onSubmit(values: CreateProductFormValues) {
    startTransition(async () => {
      setServerMessage(null);
      const result = await createProductAction(values);

      if (result.success) {
        setServerMessage(result.message);
        if (onSuccess) {
          onSuccess(result.productId);
        } else {
          // 기본 동작: 상품 목록 페이지로 이동 (추가된 상품 확인)
          setTimeout(() => {
            router.push("/products");
          }, 1000);
        }
        form.reset();
      } else {
        setServerMessage(result.message);
        if ("fieldErrors" in result && result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            const message = messages?.[0];
            if (message) {
              form.setError(field as keyof CreateProductFormValues, { message });
            }
          });
        }
      }
    });
  }

  // slug 자동 생성 헬퍼 (한글을 영문으로 변환하는 간단한 예시)
  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(name: string) {
    form.setValue("name", name);
    // slug가 비어있으면 자동 생성 제안
    if (!form.getValues("slug")) {
      const autoSlug = generateSlug(name);
      if (autoSlug) {
        form.setValue("slug", autoSlug, { shouldValidate: false });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 서버 메시지 */}
        {serverMessage && (
          <div
            className={`rounded-md p-3 text-sm ${
              serverMessage.includes("성공") || serverMessage.includes("완료")
                ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {serverMessage}
          </div>
        )}

        {/* 상품명 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                상품명 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="예: 무선 노이즈 캔슬링 헤드폰"
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                  }}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>상품의 이름을 입력해주세요. (최대 100자)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="예: wireless-noise-cancelling-headphones"
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                URL에 사용될 고유 식별자입니다. 영문 소문자, 숫자, 하이픈만 사용 가능합니다. (선택사항)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 설명 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상품 설명</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="상품에 대한 상세 설명을 입력해주세요."
                  rows={4}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>상품의 상세 설명을 입력해주세요. (최대 2000자, 선택사항)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 가격 */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                가격 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="0"
                  step="1"
                  min="0"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                  }}
                  value={field.value || ""}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>상품의 가격을 입력해주세요. (원 단위)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 통화 */}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>통화</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="통화를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="KRW">KRW (원)</SelectItem>
                  <SelectItem value="USD">USD (달러)</SelectItem>
                  <SelectItem value="EUR">EUR (유로)</SelectItem>
                  <SelectItem value="JPY">JPY (엔)</SelectItem>
                  <SelectItem value="CNY">CNY (위안)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>가격의 통화 단위를 선택해주세요.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 카테고리 */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="예: electronics, clothing, food"
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>상품의 카테고리를 입력해주세요. (선택사항)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 재고 수량 */}
        <FormField
          control={form.control}
          name="inventory_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                재고 수량 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="0"
                  step="1"
                  min="0"
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10) || 0;
                    field.onChange(value);
                  }}
                  value={field.value || ""}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>현재 보유하고 있는 재고 수량을 입력해주세요.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 판매 상태 */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base cursor-pointer">판매 활성화</FormLabel>
                <FormDescription>상품을 판매 중으로 표시할지 여부를 선택하세요.</FormDescription>
              </div>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={isPending}
                  className="h-5 w-5 rounded border-input cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 제출 버튼 */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? "저장 중..." : "상품 추가"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}

