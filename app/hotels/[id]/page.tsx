"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useHotelDetail } from "@/features/hotel";
import { getNights } from "@/utils/date";
import { filterRoomsByType } from "@/utils/filterRooms";
import { Drawer, InputNumber, Button } from "antd";
import { useRouter } from "next/navigation";
import {
  HotelDetailHeader,
  HotelImageBanner,
  HotelBasicInfo,
  RatingAndLocation,
  DateGuestSelector,
  RoomTypeFilters,
  RoomPriceList,
  HotelDetailFooter,
} from "@/components/hotel";



function getDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    checkIn: today.toISOString().slice(0, 10),
    checkOut: tomorrow.toISOString().slice(0, 10),
  };
}

function getLowestPrice(rooms: { price_detail: { price: number }[] }[]): number {
  if (!rooms?.length) return 0;
  let min = Infinity;
  for (const r of rooms) {
    if (!r.price_detail?.length) continue;
    const roomMin = Math.min(...r.price_detail.map((p) => p.price));
    if (roomMin < min) min = roomMin;
  }
  return min === Infinity ? 0 : min;
}

function HotelDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = Number(params.id);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestDrawerOpen, setGuestDrawerOpen] = useState(false);

  const checkIn = searchParams.get("check_in") ?? getDefaultDates().checkIn;
  const checkOut = searchParams.get("check_out") ?? getDefaultDates().checkOut;

  // 日期变化时更新 URL
  function handleDatesChange(ci: string, co: string) {
    const current = new URLSearchParams(searchParams.toString());
    current.set("check_in", ci);
    current.set("check_out", co);
    // replace 不产生新历史记录，用 push 则会
    router.replace(`?${current.toString()}`, { scroll: false });
  }

  const nights = getNights(checkIn, checkOut);
  const listHref = `/hotels?check_in=${checkIn}&check_out=${checkOut}`;



  const { data, loading, error } = useHotelDetail({
    hotelId,
    checkIn,
    checkOut,
  });

  // 从 data.rooms 提取每天最低价
  const dailyPrices = useMemo(() => {
    const map: Record<string, number> = {};
    if (!data?.rooms) return map;
    for (const room of data.rooms) {
      for (const pd of room.price_detail ?? []) {
        if (map[pd.date] == null || pd.price < map[pd.date]) {
          map[pd.date] = pd.price;
        }
      }
    }
    return map;
  }, [data]);

  const displayedRooms = useMemo(
    () => filterRoomsByType(data?.rooms ?? [], activeFilter),
    [data?.rooms, activeFilter]
  );

  if (isNaN(hotelId) || hotelId <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        无效的酒店ID
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HotelDetailHeader name="加载中..." />
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          加载中...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <HotelDetailHeader name="酒店详情" backHref="/" />
        <div className="flex-1 flex items-center justify-center text-red-500 px-4">
          {error || "加载失败"}
        </div>
      </div>
    );
  }

  const lowestPrice = getLowestPrice(data.rooms ?? []);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <HotelDetailHeader name={data.name} backHref={listHref} />
      <HotelImageBanner
        images={data.images ?? []}
        alt={data.name}
        reviewCount={data.review_count ?? 0}
      />
      <HotelBasicInfo
        name={data.name}
        star={data.star}
        openingDate={data.opening_date}
        facilities={data.facilities ?? []}
      />
      <RatingAndLocation
        rating={data.rating}
        reviewCount={data.review_count ?? 0}
        address={data.address}
        distance="距您直线6.1公里"
      />
      <DateGuestSelector
        checkIn={checkIn}
        checkOut={checkOut}
        nights={nights}
        editHref={listHref}
        rooms={rooms}
        adults={adults}
        // children={children}
        onGuestClick={() => setGuestDrawerOpen(true)}
        prices={dailyPrices}
        onDatesChange={handleDatesChange}
      />
      <RoomTypeFilters active={activeFilter ?? undefined}
        onFilter={(key) => setActiveFilter(key === activeFilter ? null : key)} />
      <RoomPriceList rooms={displayedRooms} nights={nights} roomCount={rooms} />
      <HotelDetailFooter lowestPrice={lowestPrice} roomCount={rooms} />
      <Drawer
        title="入住人数"
        placement="bottom"
        height="auto"
        open={guestDrawerOpen}
        onClose={() => setGuestDrawerOpen(false)}
        footer={
          <Button type="primary" block onClick={() => setGuestDrawerOpen(false)}>
            确定
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>房间</span>
            <InputNumber min={1} max={9} value={rooms} onChange={(v) => setRooms(v ?? 1)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>成人</span>
            <InputNumber min={1} max={9} value={adults} onChange={(v) => setAdults(v ?? 1)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>儿童</span>
            <InputNumber min={0} max={9} value={children} onChange={(v) => setChildren(v ?? 0)} />
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default function HotelDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-zinc-500">
          加载中...
        </div>
      }
    >
      <HotelDetailContent />
    </Suspense>
  );
}
