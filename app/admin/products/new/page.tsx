/**
 * @file page.tsx
 * @description 관리자 상품 추가 페이지
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AdminProductNewPage() {
  // 로그인 체크
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">새 상품 추가</h1>
            <p className="text-muted-foreground mt-1">상품 정보를 입력하여 새로운 상품을 등록하세요.</p>
          </div>
        </div>

        {/* 폼 */}
        <div className="rounded-lg border bg-card p-6">
          <ProductForm />
        </div>

        {/* 안내 */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">💡 참고사항</p>
          <ul className="list-disc list-inside space-y-1">
            <li>필수 항목은 빨간 별표(*)로 표시되어 있습니다.</li>
            <li>Slug는 비워두면 자동으로 UUID가 생성됩니다.</li>
            <li>상품명 입력 시 Slug가 자동 생성됩니다 (수정 가능).</li>
            <li>카테고리는 소문자와 하이픈을 권장합니다 (예: electronics, home-decor).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

