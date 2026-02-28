"use client";

import type { HotelRoom, RoomPriceDetail } from "@/types/hotel";

interface RoomPriceListProps {
  rooms: HotelRoom[];
  nights: number;
  roomCount?: number;
}

function getRoomMinPrice(priceDetail: RoomPriceDetail[]): number {
  if (!priceDetail?.length) return 0;
  return Math.min(...priceDetail.map((p) => p.price));
}

function getRoomTotalPrice(priceDetail: RoomPriceDetail[], nights: number): number {
  if (!priceDetail?.length || nights <= 0) return 0;
  return priceDetail.slice(0, nights).reduce((sum, p) => sum + p.price, 0);
}

interface RoomCardProps {
  room: HotelRoom;
  nights: number;
  minPrice: number;
  totalPrice: number;
  minStock: number;
  soldOut: boolean;
}

// 计算多晚最小库存
function getRoomMinStock(priceDetail: RoomPriceDetail[], nights: number): number {
  if (!priceDetail?.length || nights <= 0) return 0;
  return Math.min(...priceDetail.slice(0, nights).map((p) => p.stock));
}

function RoomCard({ room, nights, minPrice, totalPrice, minStock, soldOut }: RoomCardProps) {
  const specs = [
    room.bed_type && `${room.bed_type}`,
    room.area != null && `${room.area}㎡`,
    room.max_guest != null && `${room.max_guest}人入住`,
  ].filter(Boolean);

  const coverImage = room.images?.find((img) => img.type === "cover")?.url
    ?? room.images?.[0]?.url
    ?? null;

  return (
    <div className={`p-4 bg-white border-t border-zinc-100 ${soldOut ? "opacity-50" : ""}`}>
      <div className="flex gap-3">
        <div className="relative w-24 h-20 flex-shrink-0 rounded-lg bg-zinc-200 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt={room.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-zinc-400">暂无图片</span>
            </div>
          )}
          {/* 售罄蒙层 */}
          {soldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
              <span className="text-white text-xs font-medium">售罄</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-zinc-900 line-clamp-2">{room.name}</h4>
          <p className="text-xs text-zinc-500 mt-1">{specs.join(" · ")}</p>
          {room.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {room.tags.map((tag) => (
                <span key={tag.id} className="px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          {soldOut ? (
            <p className="text-sm font-medium text-zinc-400">库存不足</p>
          ) : (
            <>
              <p className="text-xs text-zinc-500">
                {nights}晚总价
                <span className="ml-1 font-semibold text-zinc-900">¥{totalPrice}</span>
              </p>
              <p className="text-blue-600 text-sm font-semibold mt-0.5">¥{minPrice}起</p>
              {minStock <= 5 && (
                <p className="text-xs text-orange-500 mt-0.5">仅剩 {minStock} 间</p>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          disabled={soldOut}
          className={`px-4 py-2 text-sm font-medium rounded
            ${soldOut
              ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              : "bg-blue-600 text-white"
            }`}
        >
          {soldOut ? "售罄" : "查看房型"}
        </button>
      </div>
    </div>
  );
}

export function RoomPriceList({ rooms, nights, roomCount = 1 }: RoomPriceListProps) {
  if (!rooms?.length) {
    return (
      <div className="px-4 py-12 text-center text-zinc-500 text-sm bg-white">
        暂无可用房型
      </div>
    );
  }

  // 售罄放最后，其余按最低价升序
  const sortedRooms = [...rooms].sort((a, b) => {
    const aStock = getRoomMinStock(a.price_detail, nights);
    const bStock = getRoomMinStock(b.price_detail, nights);
    const aSoldOut = aStock < roomCount;
    const bSoldOut = bStock < roomCount;

    if (aSoldOut && !bSoldOut) return 1;   // a 售罄，排后
    if (!aSoldOut && bSoldOut) return -1;  // b 售罄，排后
    // 都有库存或都售罄，按最低价升序
    return getRoomMinPrice(a.price_detail) - getRoomMinPrice(b.price_detail);
  });

  return (
    <section className="bg-white">
      <div className="px-4 py-3 border-t border-zinc-100">
        <h3 className="text-base font-semibold text-zinc-900">房型价格</h3>
      </div>
      <ul>
        {sortedRooms.map((room) => {
          const minPrice = getRoomMinPrice(room.price_detail);
          const totalPrice = getRoomTotalPrice(room.price_detail, nights);
          const minStock = getRoomMinStock(room.price_detail, nights);
          const soldOut = minStock < roomCount;
          return (
            <li key={room.room_id}>
              <RoomCard
                room={room}
                nights={nights}
                minPrice={minPrice}
                totalPrice={totalPrice}
                minStock={minStock}
                soldOut={soldOut}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
