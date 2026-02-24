// 首页

// export default function Home() {
//   return (
//     <div className="mt-10">
//       这里是首页
//     </div>
//   );
// }
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Home() {
  const router = useRouter();

  // 顶部tab
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("国内");

  // 城市（图里像“上海”那种）
  const [city, setCity] = useState("上海");

  // 关键词
  const [keyword, setKeyword] = useState("");

  // 日期（必须：日历组件）
  const [dateRange, setDateRange] = useState<DateRange>({
    checkIn: null,
    checkOut: null,
  });

  // 简单筛选：星级（你也可以换成价格/评分）
  const [star, setStar] = useState("不限");

  // 快捷标签（多选）
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // banner（你只做展示+点击跳转即可）
  const bannerHotelId = "h001";

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
    if (!navigator.geolocation) return alert("浏览器不支持定位");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        // 小白版：不接地图，先直接把经纬度当“当前位置”
        setCity(`${lat},${lng}`);
      },
      (err) => alert("定位失败：" + err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

   function goBanner() {
     // 只负责跳转，详情页由其他同学实现
     router.push(`/hotel/${encodeURIComponent(bannerHotelId)}`);
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
        {/* 顶部Banner（简化成一张卡片，点了跳详情） */}
        <button
          type="button"
          onClick={goBanner}
          className="relative mb-3 w-full overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_55%)]" />
          <div className="relative">
            <div className="text-xs text-blue-600">酒店特惠</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              蓝湾海景酒店
            </div>
            <div className="mt-1 text-sm text-slate-600">
              海景房 · 自助早餐 · 限时优惠
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              点击直达详情 →
            </div>
          </div>
        </button>

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
          {/* 城市 + 定位（图里左边城市 右边定位按钮那种感觉） */}
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

          {/* 日期（你的日历组件） */}
          <div className="mb-3">
            <div className="mb-1 text-xs text-slate-600">入住日期</div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          {/* 筛选条件（简化星级，下拉即可） */}
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