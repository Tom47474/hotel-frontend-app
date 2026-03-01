"use client";
import { useState } from "react";
import { Drawer } from "antd";
import { HotelDatePicker } from "@/components/hotel/HotelDatePicker";

interface DateGuestSelectorProps {
  hotelId: number;            // 用于内部请求日历价格
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms?: number;
  adults?: number;
  children?: number;
  editHref?: string;
  onGuestClick?: () => void;
  prices?: Record<string, number>;
}

function formatDisplayDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function DateGuestSelector({
  hotelId,
  checkIn,
  checkOut,
  nights,
  rooms = 1,
  adults = 1,
  children = 0,
  onGuestClick,
  onDatesChange,
}: DateGuestSelectorProps & { onDatesChange?: (ci: string, co: string) => void }) {
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);

  return (
    <>
      <div className="px-4 py-4 bg-white border-t border-zinc-100">
        {/* 日期区域，点击打开日历 */}
        <div
          className="cursor-pointer"
          onClick={() => setDateDrawerOpen(true)}
          role="button"
          tabIndex={0}
        >
          <p className="text-xs text-zinc-500 mb-1">入住 — 离店</p>
          <p className="text-sm font-medium text-zinc-900">
            {formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)}
            <span className="ml-2 text-xs text-zinc-400">共{nights}晚</span>
          </p>
        </div>
        {/* 入住人数区域 */}
        <div className="mt-3 flex items-center gap-4 text-sm text-zinc-600 cursor-pointer"
          onClick={() => onGuestClick?.()}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {rooms}间
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {adults}人
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {children}儿童
          </span>
        </div>
      </div>
      {/* 日期选择抽屉 */}
      <Drawer
        title="选择入住日期"
        placement="bottom"
        height="85vh"
        open={dateDrawerOpen}
        onClose={() => setDateDrawerOpen(false)}
        bodyStyle={{ padding: 0 }}
      >
        <HotelDatePicker
          hotelId={hotelId}
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(ci, co) => {
            onDatesChange?.(ci, co);
          }}
          onClose={() => setDateDrawerOpen(false)}
          // 注意这里不再传 prices; 组件内部会根据 hotelId 和 visible months 请求
          minNights={1}
          maxNights={30}
        />
      </Drawer>
    </>
  )

}
