"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 훅
 *
 * 사용자가 로그인한 상태에서 이 훅을 사용하면
 * 자동으로 /api/sync-user를 호출하여 Supabase users 테이블에 사용자 정보를 저장합니다.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useSyncUser } from '@/hooks/use-sync-user';
 *
 * export default function Layout({ children }) {
 *   useSyncUser();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useSyncUser() {
  // useAuth는 항상 호출해야 함 (React Hooks 규칙)
  // 이 훅은 ClerkProvider 내부에서만 호출되어야 함
  const { isLoaded, userId } = useAuth();
  
  const syncedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 로딩 중이거나 로그인하지 않은 경우 무시
    if (!isLoaded || !userId) {
      return;
    }

    // 이미 이 userId를 동기화했으면 무시
    if (syncedRef.current.has(userId)) {
      return;
    }

    // 동기화 실행
    const syncUser = async () => {
      console.group("[useSyncUser] Starting sync");
      console.log("User ID:", userId);

      try {
        const response = await fetch("/api/sync-user", {
          method: "POST",
        });

        const data = await response.json();
        console.log("Sync response:", { status: response.status, data });

        if (!response.ok) {
          console.error("Failed to sync user:", data);
          console.groupEnd();
          // 동기화 실패 시 재시도할 수 있도록 syncedRef에 추가하지 않음
          return;
        }

        console.log("✓ User sync successful");
        syncedRef.current.add(userId);
        console.groupEnd();
      } catch (error) {
        console.error("Error syncing user:", error);
        console.groupEnd();
        // 에러 발생 시 재시도할 수 있도록 syncedRef에 추가하지 않음
      }
    };

    syncUser();
  }, [isLoaded, userId]);
}
