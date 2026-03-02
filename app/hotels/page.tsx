import { Suspense } from "react";
import RedirectClient from "./RedirectClient";

/**
 * 列表页已统一使用 /list，此处仅做重定向（保留旧链接兼容）。
 * 将 /hotels?check_in=...&check_out=... 映射为 /list?checkIn=...&checkOut=...
 */
export default function HotelsRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm">
          正在跳转到列表页…
        </div>
      }
    >
      <RedirectClient />
    </Suspense>
  );
}
