"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type DateRange = {
  checkIn: string | null;  // YYYY-MM-DD
  checkOut: string | null; // YYYY-MM-DD
};

type Props = {
  value: DateRange;
  onChange: (next: DateRange) => void;
  /** 为 true 时初始就展开日历（用于列表页滑出弹窗，点击即直接看到日历） */
  defaultOpen?: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function fromISODate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime();
}
function inRange(d: Date, start: Date, end: Date) {
  return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
}
function formatLabel(iso: string | null) {
  if (!iso) return "";
  const d = fromISODate(iso);
  return `${pad2(d.getMonth() + 1)}月${pad2(d.getDate())}日`;
}

export function DateRangePicker({ value, onChange, defaultOpen = false }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));

  const checkInDate = useMemo(
    () => (value.checkIn ? fromISODate(value.checkIn) : null),
    [value.checkIn]
  );
  const checkOutDate = useMemo(
    () => (value.checkOut ? fromISODate(value.checkOut) : null),
    [value.checkOut]
  );

  // 点击外部关闭弹层
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // 生成 6周*7天的网格
  const days = useMemo(() => {
    const first = startOfMonth(month);
    const firstWeekday = (first.getDay() + 6) % 7; // 周一=0
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - firstWeekday);

    const list: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      list.push(d);
    }
    return list;
  }, [month]);

  function reset() {
    onChange({ checkIn: null, checkOut: null });
  }

  function onPick(d: Date) {
    const iso = toISODate(d);

    // 没选入住 or 已选完一整段 -> 重新开始
    if (!value.checkIn || (value.checkIn && value.checkOut)) {
      onChange({ checkIn: iso, checkOut: null });
      return;
    }

    // 已选入住，未选离店
    const inD = fromISODate(value.checkIn);
    if (sameDay(d, inD)) {
      reset();
      return;
    }
    if (isBefore(d, inD)) {
      // 离店比入住早：自动交换（更符合直觉）
      onChange({ checkIn: iso, checkOut: value.checkIn });
      setOpen(false);
      return;
    }

    onChange({ checkIn: value.checkIn, checkOut: iso });
    setOpen(false);
  }

  const label = useMemo(() => {
    if (value.checkIn && value.checkOut) {
      return `${formatLabel(value.checkIn)} - ${formatLabel(value.checkOut)}`;
    }
    if (value.checkIn) return `${formatLabel(value.checkIn)} - 选择离店`;
    return "请选择入住/离店";
  }, [value.checkIn, value.checkOut]);

  const calendarContent = (
    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-blue-100 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm hover:bg-blue-50"
            >
              ←
            </button>
            <div className="text-sm font-semibold text-slate-900">
              {month.getFullYear()}年 {month.getMonth() + 1}月
            </div>
            <button
              type="button"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm hover:bg-blue-50"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
            {["一", "二", "三", "四", "五", "六", "日"].map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const isCurrentMonth = d.getMonth() === month.getMonth();
              const isIn = checkInDate ? sameDay(d, checkInDate) : false;
              const isOut = checkOutDate ? sameDay(d, checkOutDate) : false;
              const inBetween =
                checkInDate && checkOutDate
                  ? inRange(d, checkInDate, checkOutDate)
                  : false;

              const cls =
                "rounded-lg py-2 text-sm transition " +
                (isIn || isOut
                  ? "bg-blue-600 text-white"
                  : inBetween
                  ? "bg-blue-50 text-slate-900"
                  : "hover:bg-blue-50 ") +
                (isCurrentMonth ? "" : " text-slate-400");

              return (
                <button
                  key={toISODate(d)}
                  type="button"
                  onClick={() => onPick(d)}
                  className={cls}
                  title={toISODate(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {value.checkIn ? "已选入住" : "请选择入住"}{" "}
              {value.checkOut ? "/ 已选离店" : ""}
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              清空
            </button>
          </div>
        </div>
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        <span className={value.checkIn ? "text-slate-900" : "text-slate-500"}>
          {label}
        </span>
        <span className="text-slate-400">📅</span>
      </button>
      {open && calendarContent}
    </div>
  );
}