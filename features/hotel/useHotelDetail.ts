"use client";

import { useCallback, useEffect, useState } from "react";
import { getHotelDetail } from "@/services/hotel";
import type { HotelDetail } from "@/types/hotel";
import type { HotelRoom } from "@/types/hotel";

interface UseHotelDetailParams {
  hotelId: number;
  checkIn: string;
  checkOut: string;
}

interface UseHotelDetailResult {
  data: HotelDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** 计算房型最低价（用于排序） */
function getRoomLowestPrice(room: HotelRoom): number {
  if (!room.price_detail?.length) return Infinity;
  return Math.min(...room.price_detail.map((p) => p.price));
}

/** 按价格从低到高排序房型 */
function sortRoomsByPrice(rooms: HotelRoom[]): HotelRoom[] {
  return [...rooms].sort((a, b) => getRoomLowestPrice(a) - getRoomLowestPrice(b));
}

export function useHotelDetail({
  hotelId,
  checkIn,
  checkOut,
}: UseHotelDetailParams): UseHotelDetailResult {
  const [data, setData] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getHotelDetail({ hotelId, checkIn, checkOut });
      detail.rooms = sortRoomsByPrice(detail.rooms);
      setData(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [hotelId, checkIn, checkOut]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { data, loading, error, refetch: fetchDetail };
}
