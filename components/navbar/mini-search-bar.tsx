"use client";

/**
 * @file mini-search-bar.tsx
 * @description 작은 검색창 컴포넌트 (상단바용)
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MiniSearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-9 w-9"
        aria-label="검색"
      >
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => {
            // 포커스가 벗어나면 잠시 후 닫기
            setTimeout(() => {
              if (!query.trim()) {
                setIsOpen(false);
              }
            }, 200);
          }}
          autoFocus
          className="h-9 w-32 pl-8 pr-8 text-sm"
        />
        {query && (
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
          >
            검색
          </Button>
        )}
      </div>
    </form>
  );
}

