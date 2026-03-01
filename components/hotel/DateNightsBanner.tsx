"use client";

import Link from "next/link";

interface DateNightsBannerProps {
  checkIn: string;
  checkOut: string;
  nights: number;
  /** 点击修改时跳转的 URL（如列表页带搜索条件） */
  editHref?: string;
}

function formatDisplayDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function DateNightsBanner({
  checkIn,
  checkOut,
  nights,
  editHref,
}: DateNightsBannerProps) {
  const content = (
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-y border-zinc-200">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-zinc-500">入住</p>
          <p className="text-sm font-medium text-zinc-900">
            {formatDisplayDate(checkIn)}
          </p>
        </div>
        <div className="text-zinc-300">—</div>
        <div>
          <p className="text-xs text-zinc-500">离店</p>
          <p className="text-sm font-medium text-zinc-900">
            {formatDisplayDate(checkOut)}
          </p>
        </div>
        <div className="text-sm text-zinc-600">{nights}晚</div>
      </div>
      {editHref && (
        <span className="text-sm text-blue-600">修改</span>
      )}
    </div>
  );

  if (editHref) {
    return <Link href={editHref} className="block">{content}</Link>;
  }
  return content;
}
