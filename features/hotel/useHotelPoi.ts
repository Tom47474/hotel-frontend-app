"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getHotelPoi } from "@/services/hotel";
import type { HotelPoi } from "@/types/hotel";

interface UseHotelPoiResult {
  data: HotelPoi[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** 后端返回的 POI 类型集合（用于筛选项） */
  types: string[];
}

export function useHotelPoi(hotelId: number): UseHotelPoiResult {
  const [data, setData] = useState<HotelPoi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoi = useCallback(async () => {
    if (!hotelId || Number.isNaN(hotelId)) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getHotelPoi(hotelId);
      setData(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchPoi();
  }, [fetchPoi]);

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const p of data) {
      if (p?.type) set.add(String(p.type));
    }
    return Array.from(set);
  }, [data]);

  return { data, loading, error, refetch: fetchPoi, types };
}

