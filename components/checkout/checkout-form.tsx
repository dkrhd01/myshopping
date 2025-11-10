"use client";

/**
 * @file checkout-form.tsx
 * @description 체크아웃 폼 UI 및 상호작용 컴포넌트
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { CartSummary } from "@/lib/types/cart";
import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/validations/checkout";
import { submitCheckoutAction } from "@/actions/orders";
import { formatCurrency } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CheckoutFormProps {
  cart: CartSummary;
}

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      postalCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "대한민국",
      orderNote: "",
    },
  });

  const disabled = useMemo(() => cart.items.length === 0 || isPending, [cart.items.length, isPending]);

  async function onSubmit(values: CheckoutFormValues) {
    startTransition(async () => {
      const result = await submitCheckoutAction(values);

      if (result.success && result.orderId) {
        setServerMessage(null);
        router.push(`/checkout/pay?orderId=${result.orderId}`);
      } else {
        setServerMessage(result.message);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            const message = messages?.[0];
            if (message) {
              form.setError(field as keyof CheckoutFormValues, { message });
            }
          });
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-6 rounded-3xl border bg-white p-8 shadow-lg">
          <div>
            <h2 className="text-xl font-semibold">배송 정보</h2>
            <p className="text-sm text-muted-foreground">배송에 필요한 정보를 입력해주세요.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>받는 분 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>연락처</FormLabel>
                  <FormControl>
                    <Input placeholder="010-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우편번호</FormLabel>
                  <FormControl>
                    <Input placeholder="06000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>국가</FormLabel>
                  <FormControl>
                    <Input placeholder="대한민국" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>도시</FormLabel>
                  <FormControl>
                    <Input placeholder="서울" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주/도 (선택)</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>상세 주소</FormLabel>
                  <FormControl>
                    <Input placeholder="서울특별시 강남구 테헤란로 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>상세 주소 (추가 정보)</FormLabel>
                  <FormControl>
                    <Input placeholder="101동 101호" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="orderNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>요청사항 (선택)</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="배송 기사님께 전달할 내용을 입력해주세요." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverMessage && (
            <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
              {serverMessage}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={disabled}>
              {isPending ? "확인 중..." : "주문 정보 확인"}
            </Button>
          </div>
        </section>

        <aside className="space-y-6 rounded-3xl border bg-white p-8 shadow-md">
          <div>
            <h3 className="text-lg font-semibold">주문 요약</h3>
            <p className="text-sm text-muted-foreground">결제 전 금액과 수량을 확인하세요.</p>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">상품 수량</dt>
              <dd className="font-medium">{cart.totalQuantity.toLocaleString("ko-KR")}개</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">상품 합계</dt>
              <dd className="font-semibold">
                {formatCurrency(cart.subtotal, cart.currency)}
              </dd>
            </div>
          </dl>
          <div className="rounded-xl bg-muted/30 p-4 text-xs text-muted-foreground">
            결제는 Toss Payments 테스트 모드로 진행되며, 주문 검증 후 실제 결제 단계로 이동합니다.
          </div>
        </aside>
      </form>
    </Form>
  );
}

