"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { DateRangePicker, type DateRange } from "../components/DateRangePicker";

const API_BASE = "http://140.143.171.145:4090";

/** 根据两点经纬度计算直线距离（米），Haversine 公式 */
function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // 地球半径，米
  const toRad = (x: number) => (x * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}公里`;
  return `${meters}米`;
}

// 与接口 /api/hotels 返回的 data 项结构一致（接口可能返回 latitude/longitude 为字符串、lowest_price 为 null）
type HotelItem = {
  hotel_id: number;
  name: string;
  star: number;
  rating: number;
  review_count: number;
  address: string;
  opening_date: string;
  latitude: number | string;
  longitude: number | string;
  cover_image: string;
  facilities: string[];
  lowest_price: number | null;
};

// 首页 tab -> 接口 hotel_type
const TAB_TO_HOTEL_TYPE: Record<string, string> = {
  国内: "domestic",
  海外: "overseas",
  钟点房: "hourly",
  民宿: "homestay",
};

// 首页星级 -> 接口 star_min
const STAR_TO_MIN: Record<string, string> = {
  不限: "",
  "经济/快捷": "1",
  三星: "3",
  四星: "4",
  五星: "5",
};

// 排序 -> 接口 sort
const SORT_TO_API: Record<string, string> = {
  智能排序: "",
  位置距离: "distance",
  "价格/星级": "price_asc",
  筛选: "",
};

const RATING_LABELS: Record<number, string> = {
  5: "超棒",
  4.5: "超棒",
  4: "很好",
  3.5: "不错",
  3: "不错",
};

const SORT_OPTIONS = ["智能排序", "位置距离", "价格/星级", "筛选"] as const;
const FEATURE_TAGS = [
  "解放碑步行街",
  "双床房",
  "含早餐",
  "亲子酒店",
  "返10倍积分",
] as const;

function formatDateDisplay(iso: string | null) {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${m}-${d}`;
}

function nightsBetween(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / (24 * 60 * 60 * 1000)));
}

function getRatingLabel(rating: number): string {
  const key = Math.floor(rating * 2) / 2;
  return RATING_LABELS[key] ?? "不错";
}

export default function ListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "国内";
  const cityParam = searchParams.get("city") ?? "";
  const keyword = searchParams.get("q") ?? "";
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const starParam = searchParams.get("star") ?? "不限";

  const [cityDisplay, setCityDisplay] = useState(cityParam || "我的位置");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    checkIn: checkInParam,
    checkOut: checkOutParam,
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const checkIn = dateRange.checkIn ?? checkInParam;
  const checkOut = dateRange.checkOut ?? checkOutParam;
  const city = cityDisplay || cityParam || "我的位置";

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const [activeSort, setActiveSort] = useState<(typeof SORT_OPTIONS)[number]>(
    "智能排序"
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(
    "解放碑步行街"
  );
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCityDisplay(cityParam || "我的位置");
  }, [cityParam]);

  useEffect(() => {
    setDateRange({ checkIn: checkInParam, checkOut: checkOutParam });
  }, [checkInParam, checkOutParam]);

  function handleLocate() {
    if (!navigator.geolocation) {
      alert("浏览器不支持定位");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        try {
          const res = await fetch(
            `${API_BASE}/api/getCurrentLocation?lng=${encodeURIComponent(String(lng))}&lat=${encodeURIComponent(String(lat))}`
          );
          const text = await res.text();
          let json: { code?: number; data?: { regeocode?: { addressComponent?: { city?: string; province?: string }; formatted_address?: string } } } | null = null;
          try {
            json = text ? JSON.parse(text) : null;
          } catch {
            setCityDisplay("定位成功");
            return;
          }
          if (json?.code === 200) {
            const addressComponent = json?.data?.regeocode?.addressComponent;
            const cityName = addressComponent?.city || addressComponent?.province || "";
            if (cityName) {
              setCityDisplay(cityName);
              return;
            }
            const fullAddress = json?.data?.regeocode?.formatted_address;
            if (fullAddress) setCityDisplay(fullAddress);
            else setCityDisplay("定位成功");
          } else {
            setCityDisplay("定位成功");
          }
        } catch {
          setCityDisplay("定位成功");
        }
      },
      (err) => alert("定位失败：" + err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function handleDateChange(next: DateRange) {
    setDateRange(next);
    if (next.checkIn && next.checkOut) {
      setDatePickerOpen(false);
      const params = new URLSearchParams(searchParams.toString());
      params.set("checkIn", next.checkIn);
      params.set("checkOut", next.checkOut);
      router.replace(`/list?${params.toString()}`, { scroll: false });
    }
  }

  useEffect(() => {
    const params = new URLSearchParams();
    const hotelType = TAB_TO_HOTEL_TYPE[tab];
    if (hotelType) params.set("hotel_type", hotelType);
    if (city && city !== "我的位置") params.set("city", city);
    const starMin = STAR_TO_MIN[starParam];
    if (starMin) params.set("star_min", starMin);
    const sortVal = SORT_TO_API[activeSort];
    if (sortVal) params.set("sort", sortVal);

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/hotels?${params.toString()}`)
      .then((res) => res.json())
      .then((json: { code: number; message?: string; data?: HotelItem[] }) => {
        if (cancelled) return;
        if (json?.code !== 200) {
          setError(json?.message ?? "请求失败");
          setHotels([]);
          return;
        }
        setHotels(Array.isArray(json?.data) ? json.data : []);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "加载失败");
          setHotels([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, city, starParam, activeSort]);

  const hotelsWithDistance = useMemo(() => {
    const list = hotels.map((h) => {
      const lat = Number(h.latitude);
      const lng = Number(h.longitude);
      const distanceMeters =
        userCoords && !Number.isNaN(lat) && !Number.isNaN(lng)
          ? haversineDistanceMeters(userCoords.lat, userCoords.lng, lat, lng)
          : null;
      return { hotel: h, distanceMeters };
    });
    if (activeSort === "位置距离" && userCoords) {
      return [...list].sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
    }
    return list;
  }, [hotels, userCoords, activeSort]);

  return (
    <main className="min-h-dvh bg-slate-50">
      {/* 选择日期弹窗：从顶部滑出 */}
      {datePickerOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30"
            aria-hidden
            onClick={() => setDatePickerOpen(false)}
          />
          <div className="animate-slide-down fixed inset-x-0 top-0 z-40 mx-auto max-w-[375px] rounded-b-2xl border-b border-slate-200 bg-white p-4 shadow-xl">
            <DateRangePicker value={dateRange} onChange={handleDateChange} defaultOpen />
            <button
              type="button"
              onClick={() => setDatePickerOpen(false)}
              className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-600"
            >
              关闭
            </button>
          </div>
        </>
      )}
      <div className="mx-auto max-w-[375px] bg-white">
        {/* 吸顶区域：导航 + 筛选 + 标签（苹果8布局） */}
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
          {/* 顶部导航：单行，白底，元素间浅灰分隔 */}
          <header className="flex items-stretch border-b border-slate-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-11 w-10 shrink-0 items-center justify-center text-slate-600 hover:bg-slate-50"
              aria-label="返回"
            >
              ‹
            </button>
            <div className="border-l border-slate-100" />
            <button
              type="button"
              onClick={handleLocate}
              className="shrink-0 px-2 py-2 text-sm font-medium text-blue-600"
            >
              {city}
            </button>
            <div className="border-l border-slate-100" />
            <div className="shrink-0 max-w-[110px]">
              <button
                type="button"
                onClick={() => setDatePickerOpen(true)}
                className="w-full px-2 py-2 text-left text-xs"
              >
                {checkIn && checkOut ? (
                  <span className="text-slate-900">
                    住 {formatDateDisplay(checkIn)} 离 {formatDateDisplay(checkOut)} {nights}晚
                  </span>
                ) : (
                  <span className="text-slate-400">选择日期</span>
                )}
              </button>
            </div>
            <div className="border-l border-slate-100" />
            <div className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5">
              <span className="shrink-0 text-slate-400" aria-hidden>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                defaultValue={keyword}
                placeholder="位置/品牌/酒店"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="border-l border-slate-100" />
            <button
              type="button"
              className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-slate-600 hover:bg-slate-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">地图</span>
            </button>
          </header>

        {/* 筛选/排序栏：选中项仅蓝色文字，无背景 */}
        <div className="flex border-b border-slate-100 bg-white px-1 py-1">
          {SORT_OPTIONS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveSort(label)}
              className={
                "flex flex-1 items-center justify-center gap-0.5 py-2 text-sm " +
                (activeSort === label ? "text-blue-600 font-medium" : "text-slate-600")
              }
            >
              {label}
              <span className="text-[10px] text-slate-400">▼</span>
            </button>
          ))}
        </div>

        {/* 特色标签：可左右滑动，不显示滚动条 */}
        <div
          className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-3 py-3"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {FEATURE_TAGS.map((tag) => {
            const selected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selected ? null : tag)}
                className={
                  "shrink-0 rounded-full px-3 py-1.5 text-sm " +
                  (selected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700")
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
        </div>
        {/* 酒店列表（可滚动） */}
        <ul className="flex flex-col gap-3 px-3 pb-6 pt-2">
          {loading && (
            <li className="py-8 text-center text-sm text-slate-500">
              加载中...
            </li>
          )}
          {!loading && error && (
            <li className="py-8 text-center text-sm text-red-600">{error}</li>
          )}
          {!loading && !error && hotels.length === 0 && (
            <li className="py-8 text-center text-sm text-slate-500">
              暂无酒店
            </li>
          )}
          {!loading &&
            !error &&
            hotelsWithDistance.map(({ hotel, distanceMeters }, index) => {
              const distanceText = distanceMeters != null ? formatDistance(distanceMeters) : "—";
              const detailHref =
                checkIn && checkOut
                  ? `/hotels/${hotel.hotel_id}?check_in=${checkIn}&check_out=${checkOut}`
                  : `/hotels/${hotel.hotel_id}`;
              return (
            <li key={hotel.hotel_id} className="rounded-lg border border-slate-100 bg-white py-4 px-3 shadow-sm">
              <Link href={detailHref} className="block">
              <div className="flex gap-3">
                {/* 左侧图片：酒店实景图 + 右下播放图标 */}
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hotel.cover_image}
                    alt={hotel.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  
                </div>

                {/* 右侧信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                      {hotel.name}
                    </h2>
                    <span className="shrink-0 text-amber-500 text-sm">
                      {"★".repeat(Math.min(5, hotel.star))}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    
                    <span className="text-xs text-slate-500">
                      {hotel.review_count}点评·{hotel.review_count + 1780}收藏
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    距您直线{distanceText}
                  </p>

                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                    近{hotel.address.slice(0, 10)} · 环境良好,卫生环境良好
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {hotel.facilities.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="rounded border border-blue-300 bg-slate-50 px-2 py-0.5 text-xs text-blue-600"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {index === 0 && (
                    <p className="mt-1.5 text-xs text-red-600">
                      热卖!低价房仅剩2间
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-base font-semibold text-slate-900">
                      {hotel.lowest_price != null
                        ? `¥${hotel.lowest_price}起`
                        : "询价"}
                    </span>
                    
                  </div>
                </div>
              </div>
              </Link>
            </li>
          );})}
        </ul>
      </div>
    </main>
  );
}
