"use client";

/**
 * @file toss-payment-widget.tsx
 * @description 토스 결제 위젯을 렌더링하고 결제 요청을 처리하는 컴포넌트
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

interface TossPaymentWidgetProps {
  orderId: string;
  orderName: string;
  customerKey: string;
  amount: number;
  currency: string;
  buyerName: string;
}

interface TossPaymentWidgetInstance {
  renderPaymentMethods: (
    elementId: string,
    options: { value: number; currency: string },
    variantOptions?: Record<string, unknown>,
  ) => Promise<void> | void;
  renderAgreement: (elementId: string) => Promise<void> | void;
  requestPayment: (options: Record<string, unknown>) => Promise<void>;
}

export function TossPaymentWidget({
  orderId,
  orderName,
  customerKey,
  amount,
  currency,
  buyerName,
}: TossPaymentWidgetProps) {
  const searchParams = useSearchParams();
  const [widget, setWidget] = useState<TossPaymentWidgetInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const clientKey = useMemo(() => process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "", []);

  const successUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const baseUrl = `${window.location.origin}/api/payments/toss/success`;
    const params = new URLSearchParams({ orderId });
    return `${baseUrl}?${params.toString()}`;
  }, [orderId]);

  const failUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const baseUrl = `${window.location.origin}/api/payments/toss/fail`;
    const params = new URLSearchParams({ orderId });
    return `${baseUrl}?${params.toString()}`;
  }, [orderId]);

  useEffect(() => {
    if (!clientKey) {
      setError("NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않았습니다.");
      return;
    }

    const existingScript = document.getElementById("toss-payments-script") as HTMLScriptElement | null;

    const loadWidget = async () => {
      const PaymentWidget = (window as typeof window & { PaymentWidget?: any }).PaymentWidget;

      if (!PaymentWidget) {
        setError("PaymentWidget를 찾을 수 없습니다. 스크립트 로드를 확인해주세요.");
        return;
      }

      try {
        const widgetInstance: TossPaymentWidgetInstance = await PaymentWidget(clientKey, customerKey);
        await widgetInstance.renderPaymentMethods("#payment-widget", {
          value: amount,
          currency,
        });
        await widgetInstance.renderAgreement("#payment-agreement");

        setWidget(widgetInstance);
        setIsReady(true);

        console.info("[TossWidget] initialized", {
          orderId,
          amount,
          currency,
        });
      } catch (err) {
        console.error("[TossWidget] initialization failed", err);
        setError("결제 위젯 초기화에 실패했습니다.");
      }
    };

    if (existingScript && existingScript.dataset.loaded === "true") {
      loadWidget();
      return;
    }

    const script = existingScript ?? document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment-widget";
    script.id = "toss-payments-script";
    script.async = true;

    script.onload = () => {
      script.dataset.loaded = "true";
      loadWidget();
    };

    script.onerror = () => {
      setError("토스 결제 스크립트를 불러오지 못했습니다.");
    };

    if (!existingScript) {
      document.head.appendChild(script);
    }
  }, [amount, clientKey, currency, customerKey, orderId]);

  const handlePayment = useCallback(async () => {
    if (!widget) {
      setError("결제 위젯이 아직 준비되지 않았습니다.");
      return;
    }

    try {
      console.group("[TossWidget] requestPayment");
      console.info("order info", { orderId, amount, currency, orderName });
      await widget.requestPayment({
        orderId,
        orderName,
        amount,
        currency,
        successUrl,
        failUrl,
        customerName: buyerName,
      });
      console.groupEnd();
    } catch (err) {
      console.error("[TossWidget] payment request failed", err);
      setError("결제 요청 중 오류가 발생했습니다.");
    }
  }, [amount, currency, orderId, orderName, widget, successUrl, failUrl, buyerName]);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "failed") {
      setError("결제가 취소되었거나 실패했습니다. 다시 시도해주세요.");
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          새로고침
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div id="payment-widget" className="rounded-2xl border bg-white p-4 shadow-sm" />
      <div id="payment-agreement" className="rounded-2xl border bg-white p-4 shadow-sm" />
      <Button size="lg" className="w-full" disabled={!isReady} onClick={handlePayment}>
        결제 진행하기
      </Button>
    </div>
  );
}

