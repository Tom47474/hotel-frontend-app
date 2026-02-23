"use client";

import type { HotelRoom, RoomPriceDetail } from "@/types/hotel";

interface RoomPriceListProps {
  rooms: HotelRoom[];
  nights: number;
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
}

function RoomCard({ room, nights, minPrice, totalPrice }: RoomCardProps) {
  const specs = [
    room.bed_type && `${room.bed_type}`,
    room.area != null && `${room.area}㎡`,
    room.max_guest != null && `${room.max_guest}人入住`,
  ].filter(Boolean);

  return (
    <div className="p-4 bg-white border-t border-zinc-100">
      <div className="flex gap-3">
        <div className="w-24 h-20 flex-shrink-0 rounded-lg bg-zinc-200 overflow-hidden flex items-center justify-center">
          <img
            src={`https://picsum.photos/seed/room${room.room_id}/96/80`}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-zinc-900 line-clamp-2">
            {room.name}
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            {specs.join(" ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded">
              城景
            </span>
            <span className="px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded">
              不可吸烟
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500">
            {nights}晚总价
            <span className="ml-1 font-semibold text-zinc-900">¥{totalPrice}</span>
          </p>
          <p className="text-blue-600 text-sm font-semibold mt-0.5">
            ¥{minPrice}起
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded"
        >
          查看房型
        </button>
      </div>
    </div>
  );
}

export function RoomPriceList({ rooms, nights }: RoomPriceListProps) {
  if (!rooms?.length) {
    return (
      <div className="px-4 py-12 text-center text-zinc-500 text-sm bg-white">
        暂无可用房型
      </div>
    );
  }

  return (
    <section className="bg-white">
      <div className="px-4 py-3 border-t border-zinc-100">
        <h3 className="text-base font-semibold text-zinc-900">房型价格</h3>
      </div>
      <ul>
        {rooms.map((room) => {
          const minPrice = getRoomMinPrice(room.price_detail);
          const totalPrice = getRoomTotalPrice(room.price_detail, nights);
          return (
            <li key={room.room_id}>
              <RoomCard room={room} nights={nights} minPrice={minPrice} totalPrice={totalPrice} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
