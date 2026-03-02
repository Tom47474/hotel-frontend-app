"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RedirectClient() {
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
