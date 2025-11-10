"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function CartDebugPage() {
  const { user, isLoaded } = useUser();
  const [logs, setLogs] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    if (isLoaded && user) {
      addLog(`✓ Clerk User Loaded: ${user.id}`);
      addLog(`  Name: ${user.fullName || "No name"}`);
      addLog(`  Email: ${user.primaryEmailAddress?.emailAddress || "No email"}`);
    } else if (isLoaded && !user) {
      addLog("✗ No user logged in");
    }
  }, [isLoaded, user]);

  const handleSyncUser = async () => {
    if (!user) {
      addLog("✗ Cannot sync: No user logged in");
      return;
    }

    setSyncing(true);
    addLog("→ Starting user sync...");

    try {
      const response = await fetch("/api/sync-user", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        addLog("✓ User sync successful");
        addLog(`  Supabase User ID: ${data.user?.id || "N/A"}`);
      } else {
        addLog(`✗ User sync failed: ${data.error}`);
        if (data.details) {
          addLog(`  Details: ${data.details}`);
        }
      }
    } catch (error) {
      addLog(`✗ Error during sync: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleCheckDatabase = async () => {
    addLog("→ Checking database connection...");

    try {
      const response = await fetch("/api/debug/check-db", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        addLog("✓ Database connection OK");
        addLog(`  Users table exists: ${data.usersTableExists ? "Yes" : "No"}`);
        addLog(`  Cart items table exists: ${data.cartItemsTableExists ? "Yes" : "No"}`);
        addLog(`  Current user in DB: ${data.currentUserExists ? "Yes" : "No"}`);
        if (data.currentUserExists) {
          addLog(`  Supabase User ID: ${data.supabaseUserId}`);
        }
      } else {
        addLog(`✗ Database check failed: ${data.error}`);
      }
    } catch (error) {
      addLog(`✗ Error checking database: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold mb-6">장바구니 디버그 도구</h1>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-6">장바구니 디버그 도구</h1>

      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            ⚠️ 로그인이 필요합니다. 디버그 기능을 사용하려면 먼저 로그인하세요.
          </p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex gap-4">
          <Button onClick={handleSyncUser} disabled={!user || syncing}>
            {syncing ? "동기화 중..." : "사용자 동기화"}
          </Button>
          <Button onClick={handleCheckDatabase} disabled={!user} variant="outline">
            데이터베이스 확인
          </Button>
          <Button onClick={handleClearLogs} variant="ghost">
            로그 지우기
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500">로그가 없습니다. 버튼을 클릭하여 테스트를 시작하세요.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-bold text-blue-900 mb-2">사용 방법</h2>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
          <li>먼저 로그인하세요</li>
          <li>&quot;사용자 동기화&quot; 버튼을 클릭하여 Clerk 사용자를 Supabase에 동기화하세요</li>
          <li>&quot;데이터베이스 확인&quot; 버튼을 클릭하여 테이블과 사용자 정보를 확인하세요</li>
          <li>모든 체크가 성공하면 장바구니 기능을 사용할 수 있습니다</li>
        </ol>
      </div>
    </div>
  );
}

