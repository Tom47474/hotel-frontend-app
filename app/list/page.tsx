import { Suspense } from "react";
import ListPageClient from "./ListPageClient";

// 服务器组件中不能有 'use client'

export default function ListPage() {
  // 动态导入客户端组件并用 Suspense 包裹
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ListPageClient />
    </Suspense>
  );
}
