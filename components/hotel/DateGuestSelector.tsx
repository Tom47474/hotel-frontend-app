"use client";

import Link from "next/link";

interface DateGuestSelectorProps {
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms?: number;
  adults?: number;
  children?: number;
  editHref?: string;
  onGuestClick?: () => void;
}

function formatDisplayDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function DateGuestSelector({
  checkIn,
  checkOut,
  nights,
  rooms = 1,
  adults = 1,
  children = 0,
  onGuestClick,
}: DateGuestSelectorProps) {
  const content = (
    <div className="px-4 py-4 bg-white border-t border-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-1">今天 明天</p>
          <p className="text-sm font-medium text-zinc-900">
            {formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            共{nights}晚
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-zinc-600 cursor-pointer"
        onClick={() => onGuestClick?.()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onGuestClick?.()}>
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
  );

  return content;
}
