"use client";

import { useCallback, useEffect, useState } from "react";
import { getHotelDetail } from "@/services/hotel";
import type { HotelDetail } from "@/types/hotel";

interface UseCalendarPricesParams {
  hotelId: number;
  start: string;  // YYYY-MM-DD
  end: string;    // YYYY-MM-DD
}

interface UseCalendarPricesResult {
  prices: Record<string, number>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches hotel detail for an arbitrary date range and exposes a simple
 * map from date->min price.  This is intended for the calendar picker where
 * we want pricing information outside the user-selected check-in/out.
 */
export function useCalendarPrices({ hotelId, start, end }: UseCalendarPricesParams): UseCalendarPricesResult {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The backend often expects `check_out` to be exclusive. Also avoid
      // toISOString() which can shift local midnight to previous/next day in UTC.
      // Build local date strings and send check_out as end + 1 day so the
      // returned price_detail includes the inclusive `end` date.
      function parseYMD(s: string) {
        const [y, m, d] = s.split("-").map(Number);
        return new Date(y, m - 1, d);
      }
      function fmtLocal(d: Date) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
      }

      const checkInDate = parseYMD(start);
      const checkOutDate = parseYMD(end);
      const checkOutExclusive = new Date(checkOutDate);
      checkOutExclusive.setDate(checkOutExclusive.getDate() + 1);

      const detail = await getHotelDetail({
        hotelId,
        checkIn: fmtLocal(checkInDate),
        checkOut: fmtLocal(checkOutExclusive),
      });

      const map: Record<string, number> = {};
      for (const room of detail.rooms ?? []) {
        for (const pd of room.price_detail ?? []) {
          if (map[pd.date] == null || pd.price < map[pd.date]) {
            map[pd.date] = pd.price;
          }
        }
      }
      setPrices(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载价格失败");
      setPrices({});
    } finally {
      setLoading(false);
    }
  }, [hotelId, start, end]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, loading, error, refetch: fetchPrices };
}
