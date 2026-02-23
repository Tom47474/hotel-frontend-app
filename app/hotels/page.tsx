"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getHotelList } from "@/services/hotel";
import type { HotelListItem } from "@/services/hotel";

function getDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    checkIn: today.toISOString().slice(0, 10),
    checkOut: tomorrow.toISOString().slice(0, 10),
  };
}

function HotelsListContent() {
  const searchParams = useSearchParams();
  const { checkIn, checkOut } = useMemo(() => {
    const ci = searchParams.get("check_in");
    const co = searchParams.get("check_out");
    if (ci && co) return { checkIn: ci, checkOut: co };
    return getDefaultDates();
  }, [searchParams]);

  const [list, setList] = useState<HotelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getHotelList({ check_in: checkIn, check_out: checkOut })
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [checkIn, checkOut]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-3">
        <Link href="/" className="text-blue-600 text-sm">
          ← 返回首页
        </Link>
        <p className="mt-1 text-sm text-zinc-600">
          {checkIn} 至 {checkOut}
        </p>
      </header>
      <main className="px-4 py-4">
        {loading && <p className="text-zinc-500 text-center py-8">加载中...</p>}
        {error && (
          <p className="text-red-500 text-center py-8">{error}</p>
        )}
        {!loading && !error && list.length === 0 && (
          <p className="text-zinc-500 text-center py-8">暂无酒店</p>
        )}
        {!loading && !error && list.length > 0 && (
          <ul className="space-y-4">
            {list.map((h) => (
              <li key={h.hotel_id}>
                <Link
                  href={`/hotels/${h.hotel_id}?check_in=${checkIn}&check_out=${checkOut}`}
                  className="block p-4 bg-white rounded-lg border border-zinc-200 hover:border-zinc-300"
                >
                  {h.cover_image && (
                    <img
                      src={h.cover_image}
                      alt={h.name}
                      className="w-full aspect-video object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-medium text-zinc-900">{h.name}</h3>
                  <p className="text-sm text-zinc-600 mt-1">{h.address}</p>
                  <p className="text-amber-600 font-semibold mt-2">
                    ¥{h.lowest_price}起
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function HotelsListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        加载中...
      </div>
    }>
      <HotelsListContent />
    </Suspense>
  );
}
