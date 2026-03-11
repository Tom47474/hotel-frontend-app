"use client";

import { useMemo, useState } from "react";
import { Button, Empty, List, Segmented, Select, Spin, Tag } from "antd";
import { useHotelPoi } from "@/features/hotel";
import type { HotelPoi } from "@/types/hotel";
import { HotelPoiMap } from "./HotelPoiMap";

const TYPE_LABEL: Record<string, string> = {
  traffic: "交通",
  scenic: "景点",
  food: "美食",
  shopping: "购物",
  business: "商务",
  hospital: "医院",
  school: "学校",
  other: "其他",
};

function formatDistance(m: number) {
  if (!Number.isFinite(m)) return "";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

export interface HotelPoiSectionProps {
  hotelId: number;
  hotelName?: string;
  hotelLatitude?: number;
  hotelLongitude?: number;
}

export function HotelPoiSection({
  hotelId,
  hotelName,
  hotelLatitude,
  hotelLongitude,
}: HotelPoiSectionProps) {
  const { data, loading, error, refetch, types } = useHotelPoi(hotelId);
  const [type, setType] = useState<string>("all");
  const [sort, setSort] = useState<"distance_asc" | "distance_desc">("distance_asc");
  const [selectedPoiId, setSelectedPoiId] = useState<number | undefined>(undefined);

  const hotelPosition = useMemo(() => {
    const lat = Number(hotelLatitude);
    const lng = Number(hotelLongitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    return [lat, lng] as [number, number];
  }, [hotelLatitude, hotelLongitude]);

  const typeOptions = useMemo(() => {
    const opts: Array<{ label: string; value: string }> = [{ label: "全部", value: "all" }];
    const sorted = [...(types ?? [])].sort((a, b) => a.localeCompare(b));
    for (const t of sorted) {
      opts.push({ label: TYPE_LABEL[t] ?? t, value: t });
    }
    return opts;
  }, [types]);

  const filtered = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const byType = type === "all" ? list : list.filter((p) => String(p.type) === type);
    const sorted = [...byType].sort((a, b) => {
      const da = Number(a.distance) || 0;
      const db = Number(b.distance) || 0;
      return sort === "distance_asc" ? da - db : db - da;
    });
    return sorted;
  }, [data, type, sort]);

  const mapPois = useMemo(() => {
    // Keep map responsive: show top 50 after filtering/sorting.
    return filtered.slice(0, 50);
  }, [filtered]);

  return (
    <section className="bg-white border-t border-zinc-100">
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900">周边兴趣点（POI）</h3>
        <div className="flex items-center gap-2">
          <Select
            size="small"
            value={sort}
            onChange={(v) => setSort(v)}
            options={[
              { label: "距离最近", value: "distance_asc" },
              { label: "距离最远", value: "distance_desc" },
            ]}
            style={{ width: 110 }}
          />
          <Button size="small" onClick={refetch}>
            刷新
          </Button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <Segmented
          block
          options={typeOptions.map((o) => ({ label: o.label, value: o.value }))}
          value={type}
          onChange={(v) => setType(String(v))}
        />
      </div>

      <div className="px-4 pb-3">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Spin />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="text-sm text-red-500">{error}</div>
            <div className="mt-3">
              <Button onClick={refetch}>重试</Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8">
            <Empty description="暂无POI" />
          </div>
        ) : (
          <>
            {!hotelPosition && (
              <div className="mb-2 text-xs text-orange-600">
                酒店缺少经纬度，无法绘制酒店位置点（请确认酒店详情接口返回 latitude/longitude）。
              </div>
            )}
            <HotelPoiMap
              pois={mapPois}
              hotelName={hotelName}
              hotelPosition={hotelPosition}
              allowFallbackHotelPosition={false}
              selectedPoiId={selectedPoiId}
              onSelectPoi={(id: number) => setSelectedPoiId(id)}
              height={220}
            />

            <div className="mt-3">
              <List
                itemLayout="horizontal"
                dataSource={filtered}
                renderItem={(item: HotelPoi) => {
                  const isSelected = selectedPoiId != null && selectedPoiId === item.poi_id;
                  return (
                    <List.Item
                      onClick={() => setSelectedPoiId(item.poi_id)}
                      style={{ cursor: "pointer" }}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center gap-2">
                            <span className={isSelected ? "text-blue-600" : ""}>
                              {item.name}
                            </span>
                            <Tag color="blue">{TYPE_LABEL[String(item.type)] ?? String(item.type)}</Tag>
                          </div>
                        }
                        description={
                          <div className="text-sm text-zinc-600">
                            距离 {formatDistance(Number(item.distance))}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

