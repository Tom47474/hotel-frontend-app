"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import type { HotelPoi } from "@/types/hotel";
import dynamic from "next/dynamic";
// 1. 引入 Leaflet 核心样式（关键修复：缺失样式会导致 Marker 图标不显示）
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 修复 Leaflet 默认图标路径（解决 Next.js 中图标雪碧图加载失败问题）
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// Avoid SSR for leaflet components.
// 2. 优化 dynamic 加载：增加 loading 状态，确保组件完全加载后渲染
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false, loading: () => <div>地图加载中...</div> }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);

function clampLatLng(p: HotelPoi) {
  const lat = Number(p.latitude);
  const lng = Number(p.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng)
    ? ([lat, lng] as [number, number])
    : null;
}

export interface HotelPoiMapProps {
  pois: HotelPoi[];
  hotelName?: string;
  hotelPosition?: [number, number];
  allowFallbackHotelPosition?: boolean;
  selectedPoiId?: number;
  onSelectPoi?: (poiId: number) => void;
  height?: number;
}

export function HotelPoiMap({
  pois,
  hotelName,
  hotelPosition,
  allowFallbackHotelPosition = true,
  selectedPoiId,
  onSelectPoi,
  height = 220,
}: HotelPoiMapProps) {
  // 3. 增加地图加载状态：确保 window 就绪后再渲染地图（避免 SSR 残留问题）
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // 确认浏览器环境（window 存在）
    if (typeof window !== "undefined") {
      setIsMapReady(true);
    }
  }, []);

  const points = useMemo(() => {
    return (pois ?? []).map(clampLatLng).filter(Boolean) as Array<[number, number]>;
  }, [pois]);

  const fallbackHotelPosition: [number, number] | undefined = useMemo(() => {
    if (hotelPosition || !allowFallbackHotelPosition) return undefined;
    if (!points.length) return undefined;
    const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
    const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
    return [lat, lng] as [number, number];
  }, [allowFallbackHotelPosition, hotelPosition, points]);

  const effectiveHotelPosition = hotelPosition ?? fallbackHotelPosition;

  const center = useMemo(() => {
    if (effectiveHotelPosition) return effectiveHotelPosition;
    if (!points.length) return [39.9042, 116.4074] as [number, number]; // fallback: Beijing
    const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
    const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
    return [lat, lng] as [number, number];
  }, [points, effectiveHotelPosition]);


  // 4. 未就绪时显示占位符，避免组件提前渲染
  if (!isMapReady) {
    return (
      <div className="rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50" style={{ height }}>
        <div className="h-full w-full flex items-center justify-center text-sm text-zinc-500">
          地图初始化中...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50" style={{ height }}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }} // 修复：高度继承父容器，避免高度计算异常
      >
        {/* <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
        {/* 高德地图卫星图 */}
        {/* <TileLayer
          attribution='© 2025 高德地图 GS(2024)6085号'
          // 高德卫星地图底图
          url="https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']}
          maxZoom={18}
          minZoom={3}
        />
        {/* // 可选：叠加卫星地图的路网标注（和卫星底图配合使用） */}
        {/* <TileLayer
          attribution='© 2025 高德地图 GS(2024)6085号'
          url="https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']}
          maxZoom={18}
          minZoom={3}
        /> */} */
        {/* 高德地图瓦片图 */}
        <TileLayer
          attribution='© 2025 高德地图 GS(2024)6085号' // 高德版权声明，必填
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']} // 高德子域名，对应url中的{s}
          maxZoom={18} // 高德瓦片最大缩放级别18，贴合国内街道级
          minZoom={3}  // 高德瓦片最小缩放级别3，避免过度缩小
          // 瓦片加载失败时降级到 OpenStreetMap
          errorTileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {effectiveHotelPosition && (
          <CircleMarker
            center={effectiveHotelPosition}
            radius={8}
            pathOptions={{ color: "#ff4d4f", fillColor: "#ff4d4f", fillOpacity: 1 }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">
                  {hotelName ? `${hotelName}（酒店）` : "酒店"}
                </div>
                {!hotelPosition && fallbackHotelPosition && (
                  <div className="text-xs text-zinc-600 mt-1">
                    酒店坐标缺失，使用 POI 中心点估算
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )}

        {(pois ?? []).map((p) => {
          const latlng = clampLatLng(p);
          if (!latlng) return null;
          const isSelected = selectedPoiId != null && p.poi_id === selectedPoiId;
          return (
            <Marker
              key={p.poi_id}
              position={latlng}
              eventHandlers={{
                click: () => onSelectPoi?.(p.poi_id),
              }}
              // 可选：自定义 Marker 图标（如果默认图标仍有问题，可替换为自定义图标）
              // icon={L.icon({
              //   iconUrl: '/custom-marker.png', // 本地图标，需放在 public 目录
              //   iconSize: [25, 41],
              //   iconAnchor: [12, 41],
              // })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-zinc-600">{p.distance}m</div>
                  {isSelected && <div className="text-blue-600">已选中</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}