"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/utils/api";
import { Chip } from "./components/Chip";
import { DateRangePicker, type DateRange } from "./components/DateRangePicker";

const tabs = ["国内", "海外", "钟点房", "民宿"] as const;

const quickTags = [
  "免费停车",
  "亲子",
  "豪华",
  "含早餐",
  "健身房",
  "泳池",
  "可带宠物",
] as const;

type BannerItem = {
  id: number;
  image_url: string;
  hotel_id: number;
  title: string;
};

export default function Home() {
  const router = useRouter();

    // ===== Banner（接口获取）=====
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBanners() {
      try {
        setBannerLoading(true);
        setBannerError(null);

        const res = await fetch(`${getApiBaseUrl()}/api/banners`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (json?.code !== 200) throw new Error(json?.message || "接口返回异常");

        setBanners(Array.isArray(json?.data) ? (json.data as BannerItem[]) : []);
      } catch (e: any) {
        setBannerError(e?.message || "获取banner失败");
        setBanners([]);
      } finally {
        setBannerLoading(false);
      }
    }

    fetchBanners();
  }, []);

  // 顶部tab
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("国内");

  // 城市
  const [city, setCity] = useState("上海");

  // 关键词
  const [keyword, setKeyword] = useState("");

  // 日期（日历组件）
  const [dateRange, setDateRange] = useState<DateRange>({
    checkIn: null,
    checkOut: null,
  });

  // 简单筛选：星级
  const [star, setStar] = useState("不限");

  // 快捷标签（多选）
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const canSearch = useMemo(
    () => Boolean(dateRange.checkIn && dateRange.checkOut),
    [dateRange.checkIn, dateRange.checkOut]
  );

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      alert("浏览器不支持定位");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const url = `${getApiBaseUrl()}/api/getCurrentLocation?lng=${encodeURIComponent(
            String(lng)
          )}&lat=${encodeURIComponent(String(lat))}`;

          const res = await fetch(url);

          // 先读 text，再 JSON.parse，避免空响应导致 res.json() 报错
          const text = await res.text();
          let json: any = null;

          try {
            json = text ? JSON.parse(text) : null;
          } catch {
            throw new Error(
              `接口返回不是JSON：${text.slice(0, 120) || "(空响应)"}，HTTP ${res.status}`
            );
          }

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          if (!json || json.code !== 200) {
            throw new Error(json?.message || "接口返回异常");
          }

          // 你的响应结构：data.regeocode.addressComponent.city
          const addressComponent = json?.data?.regeocode?.addressComponent;
          const city =
            addressComponent?.city ||
            addressComponent?.province || // 有些城市可能返回空，用省兜底
            "";

          if (city) {
            setCity(city); //  显示城市名
            return;
          }

          // 再兜底：用 formatted_address
          const fullAddress = json?.data?.regeocode?.formatted_address;
          if (fullAddress) {
            setCity(fullAddress);
            return;
          }

          setCity("定位成功（未识别城市）");
        } catch (e: any) {
          alert("定位成功，但获取城市失败：" + (e?.message || "未知错误"));
          // 最后兜底：显示经纬度
          setCity(`${lat.toFixed(5)},${lng.toFixed(5)}`);
        }
      },
      (err) => {
        alert("定位失败：" + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function handleSearch() {
    // 只负责跳转，列表页由其他同学实现
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    params.set("city", city);
    if (keyword.trim()) params.set("q", keyword.trim());
    if (dateRange.checkIn) params.set("checkIn", dateRange.checkIn);
    if (dateRange.checkOut) params.set("checkOut", dateRange.checkOut);
    if (star !== "不限") params.set("star", star);
    if (selectedTags.length) params.set("tags", selectedTags.join(","));

    router.push(`/list?${params.toString()}`);
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-md px-4 pb-10 pt-4">
        {/* 顶部Banner（接口获取） */}
        <section className="mb-3">
          {bannerLoading && (
            <div className="rounded-2xl border border-blue-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
              Banner 加载中...
            </div>
          )}

          {!bannerLoading && bannerError && (
            <div className="rounded-2xl border border-red-100 bg-white p-4 text-sm text-red-600 shadow-sm">
              Banner 获取失败：{bannerError}
            </div>
          )}

          {!bannerLoading && !bannerError && banners.length > 0 && (
            <div className="grid gap-3">
              {/* 只显示第一个 Banner */}
              <button
                key={banners[0].id}
                type="button"
                onClick={() => router.push(`/hotels/${banners[0].hotel_id}`)}
                className="relative w-full overflow-hidden rounded-2xl border border-blue-100 bg-white text-left shadow-sm"
              >
                <div className="h-36 w-full bg-blue-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banners[0].image_url}
                    alt={banners[0].title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <div className="text-xs text-blue-600">广告</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {banners[0].title}
                  </div>
                  <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    点击直达详情 →
                  </div>
                </div>
              </button>
            </div>
          )}

          {!bannerLoading && !bannerError && banners.length === 0 && (
            <div className="rounded-2xl border border-blue-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
              暂无 Banner
            </div>
          )}
        </section>

        {/* tab栏（国内/海外/钟点房/民宿） */}
        <div className="mb-3 flex rounded-2xl border border-blue-100 bg-white p-1 shadow-sm">
          {tabs.map((t) => {
            const active = t === activeTab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={
                  "flex-1 rounded-2xl px-3 py-2 text-sm font-medium transition " +
                  (active
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-blue-50")
                }
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* 核心查询卡片 */}
        <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          {/* 城市 + 定位（左边城市 右边定位按钮） */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex-1">
              <div className="mb-1 text-xs text-slate-600">城市</div>
              <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm outline-none"
                  placeholder="如：上海"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleLocate}
              className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              title="获取当前位置"
            >
              定位
            </button>
          </div>

          {/* 关键词 */}
          <div className="mb-3">
            <div className="mb-1 text-xs text-slate-600">位置/品牌/酒店</div>
            <div className="rounded-xl border border-slate-200 px-3 py-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full text-sm outline-none"
                placeholder="如：外滩 / 迪士尼 / 万豪"
              />
            </div>
          </div>

          {/* 日期（日历组件） */}
          <div className="mb-3">
            <div className="mb-1 text-xs text-slate-600">入住日期</div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          {/* 筛选条件（星级，下拉即可） */}
          <div className="mb-3">
            <div className="mb-1 text-xs text-slate-600">筛选</div>
            <select
              value={star}
              onChange={(e) => setStar(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option>不限</option>
              <option>经济/快捷</option>
              <option>三星</option>
              <option>四星</option>
              <option>五星</option>
            </select>
          </div>

          {/* 快捷标签 */}
          <div className="mb-4">
            <div className="mb-2 text-xs text-slate-600">快捷标签</div>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={selectedTags.includes(t)}
                  onClick={() => toggleTag(t)}
                />
              ))}
            </div>
          </div>

          {/* 查询按钮（图里那种大蓝按钮） */}
          <button
            type="button"
            disabled={!canSearch}
            onClick={handleSearch}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            查询
          </button>

          {!canSearch && (
            <p className="mt-2 text-center text-xs text-slate-500">
              请选择入住/离店日期后再查询
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
