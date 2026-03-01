"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 列表页已统一使用 /list，此处仅做重定向（保留旧链接兼容）。
 * 将 /hotels?check_in=...&check_out=... 映射为 /list?checkIn=...&checkOut=...
 */
export default function HotelsRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    const checkIn = searchParams.get("check_in");
    const checkOut = searchParams.get("check_out");
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    router.replace(`/list${params.toString() ? `?${params.toString()}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm">
      正在跳转到列表页…
    </div>
  );
}
