"use client";

import { useState, useCallback, useEffect } from "react";

interface HotelDatePickerProps {
  checkIn: string;        // YYYY-MM-DD
  checkOut: string;       // YYYY-MM-DD
  onChange: (checkIn: string, checkOut: string) => void;
  onClose?: () => void;
  /** 每个日期的最低价格，key 为 YYYY-MM-DD */
  prices?: Record<string, number>;
  minNights?: number;     // 最少入住晚数，默认 1
  maxNights?: number;     // 最多入住晚数，默认 30
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function formatDisplay(s: string): string {
  if (!s) return "";
  const d = parseDate(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function getWeekdayLabel(s: string): string {
  const d = parseDate(s);
  return `周${WEEKDAYS[d.getDay()]}`;
}

/** 生成某年某月的日历格子（含前后补位） */
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const grid: (Date | null)[] = [];
  // 前补
  for (let i = 0; i < firstDay.getDay(); i++) grid.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d));
  // 后补至整行
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export function HotelDatePicker({
  checkIn,
  checkOut,
  onChange,
  onClose,
  prices = {},
  minNights = 1,
  maxNights = 30,
}: HotelDatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 显示从今天所在月开始的月份
  const [baseYear, setBaseYear] = useState(today.getFullYear());
  const [baseMonth, setBaseMonth] = useState(today.getMonth());

  // 选择状态：null | 'start'(已选入住，等待选离店)
  const [selecting, setSelecting] = useState<"idle" | "start">("idle");
  const [tempStart, setTempStart] = useState<string | null>(null);
  const [tempEnd, setTempEnd] = useState<string | null>(null); // pending checkout date until confirmation
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const ciDate = checkIn ? parseDate(checkIn) : null;
  const coDate = checkOut ? parseDate(checkOut) : null;

  // 当前展示两个月
  const months = [
    { year: baseYear, month: baseMonth },
    (() => {
      const m = baseMonth + 1;
      return m > 11 ? { year: baseYear + 1, month: 0 } : { year: baseYear, month: m };
    })(),
  ];

  const prevMonth = useCallback(() => {
    if (baseMonth === 0) { setBaseYear(y => y - 1); setBaseMonth(11); }
    else setBaseMonth(m => m - 1);
  }, [baseMonth]);

  const nextMonth = useCallback(() => {
    if (baseMonth === 11) { setBaseYear(y => y + 1); setBaseMonth(0); }
    else setBaseMonth(m => m + 1);
  }, [baseMonth]);

  // 判断某日期是否在选择范围内（高亮区间）
  function isInRange(dateStr: string): boolean {
    const start = tempStart ?? checkIn;
    const end = selecting === "start" ? (hoverDate ?? null) : tempEnd ?? checkOut;
    if (!start || !end) return false;
    const d = parseDate(dateStr);
    const s = parseDate(start);
    const e = parseDate(end);
    if (s > e) return d >= e && d <= s;
    return d > s && d < e;
  }

  function isRangeStart(dateStr: string): boolean {
    return dateStr === (tempStart ?? checkIn);
  }

  function isRangeEnd(dateStr: string): boolean {
    const end = selecting === "start" ? (hoverDate ?? null) : tempEnd ?? checkOut;
    return dateStr === end;
  }

  function isDisabled(date: Date): boolean {
    if (date < today) return true;
    if (selecting === "start" && tempStart) {
      const start = parseDate(tempStart);
      const diff = diffDays(start, date);
      if (diff < minNights || diff > maxNights) return true;
    }
    return false;
  }

  function handleDayClick(date: Date) {
    if (date < today) return;
    const ds = toDateStr(date);

    if (selecting === "idle") {
      // 第一步：选入住日
      setTempStart(ds);
      setTempEnd(null);
      setSelecting("start");
    } else {
      // 第二步：选离店日，先只存储，不触发 onChange
      if (!tempStart) return;
      const start = parseDate(tempStart);
      const diff = diffDays(start, date);
      if (diff < minNights) return;
      if (diff > maxNights) return;
      if (date <= start) {
        // 点了更早的日期，重新选为入住
        setTempStart(ds);
        setTempEnd(null);
        return;
      }
      // 保存待确认的离店日期
      setTempEnd(ds);
      setSelecting("idle");
      setHoverDate(null);
    }
  }

  function handleDayHover(date: Date) {
    if (selecting === "start") {
      setHoverDate(toDateStr(date));
    }
  }

  // 计算展示的入住/离店日期和晚数。优先使用临时未确认的值。
  const nights =
    tempStart && tempEnd
      ? diffDays(parseDate(tempStart), parseDate(tempEnd))
      : ciDate && coDate
      ? diffDays(ciDate, coDate)
      : 0;
  const displayStart = tempStart ?? checkIn;
  const displayEnd =
    tempEnd ?? (selecting === "start" ? null : checkOut);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'PingFang SC', 'Hiragino Sans GB', sans-serif" }}>

      {/* 顶部已选信息 */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
          <div className={`flex-1 px-4 py-3 ${selecting === "idle" && !checkIn ? "bg-blue-50 border-b-2 border-blue-500" : ""}`}>
            <p className="text-xs text-zinc-400 mb-0.5">入住</p>
            {displayStart ? (
              <>
                <p className="text-base font-semibold text-zinc-900">{formatDisplay(displayStart)}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{getWeekdayLabel(displayStart)}</p>
              </>
            ) : (
              <p className="text-base font-medium text-zinc-300">请选择</p>
            )}
          </div>

          <div className="flex items-center px-3">
            {nights > 0 ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-px bg-zinc-300" />
                <p className="text-xs text-zinc-500 mt-1">{nights}晚</p>
              </div>
            ) : (
              <div className="w-12 h-px bg-zinc-200" />
            )}
          </div>

          <div className={`flex-1 px-4 py-3 ${selecting === "start" ? "bg-blue-50 border-b-2 border-blue-500" : ""}`}>
            <p className="text-xs text-zinc-400 mb-0.5">离店</p>
            {displayEnd ? (
              <>
                <p className="text-base font-semibold text-zinc-900">{formatDisplay(displayEnd)}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{getWeekdayLabel(displayEnd)}</p>
              </>
            ) : (
              <p className="text-base font-medium text-zinc-300">
                {selecting === "start" ? "请选择" : "请选择"}
              </p>
            )}
          </div>
        </div>

        {selecting === "start" && tempStart && (
          <p className="mt-2 text-xs text-blue-500 text-center">
            请选择离店日期（最少{minNights}晚，最多{maxNights}晚）
          </p>
        )}
        {selecting === "idle" && !checkIn && (
          <p className="mt-2 text-xs text-zinc-400 text-center">请选择入住日期</p>
        )}
      </div>

      {/* 月份导航 */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500"
          disabled={baseYear === today.getFullYear() && baseMonth === today.getMonth()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-sm font-medium text-zinc-700">
          {MONTHS[baseMonth]} {baseYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* 日历主体（可滚动） */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {months.map(({ year, month }) => {
          const grid = buildMonthGrid(year, month);
          return (
            <div key={`${year}-${month}`} className="mb-6">
              <p className="text-sm font-semibold text-zinc-700 mb-3 text-center">
                {year}年{MONTHS[month]}
              </p>
              {/* 周标题 */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="text-center text-xs text-zinc-400 py-1">{w}</div>
                ))}
              </div>
              {/* 日期格子 */}
              <div className="grid grid-cols-7">
                {grid.map((date, idx) => {
                  if (!date) return <div key={idx} />;
                  const ds = toDateStr(date);
                  const isPast = date < today;
                  const disabled = isDisabled(date);
                  const isStart = isRangeStart(ds);
                  const isEnd = isRangeEnd(ds);
                  const inRange = isInRange(ds);
                  const isToday = toDateStr(date) === toDateStr(today);
                  const price = prices[ds];

                  let cellBg = "";
                  if (isStart) cellBg = "bg-blue-600 text-white rounded-full";
                  else if (isEnd) cellBg = "bg-blue-600 text-white rounded-full";
                  else if (inRange) cellBg = "bg-blue-50";

                  return (
                    <div
                      key={ds}
                      className={`relative flex flex-col items-center justify-center py-1 cursor-pointer select-none
                        ${inRange && !isStart && !isEnd ? "bg-blue-50" : ""}
                        ${isStart ? "rounded-l-full" : ""}
                        ${isEnd ? "rounded-r-full" : ""}
                      `}
                      onClick={() => !disabled && !isPast && handleDayClick(date)}
                      onMouseEnter={() => !disabled && !isPast && handleDayHover(date)}
                    >
                      <div className={`w-9 h-9 flex flex-col items-center justify-center rounded-full
                        ${isStart || isEnd ? "bg-blue-600" : ""}
                        ${!isStart && !isEnd && !isPast && !disabled ? "hover:bg-zinc-100" : ""}
                        ${isPast || disabled ? "opacity-30 cursor-not-allowed" : ""}
                      `}>
                        <span className={`text-sm leading-none font-medium
                          ${isStart || isEnd ? "text-white" : isToday ? "text-blue-600" : "text-zinc-800"}
                          ${isPast ? "text-zinc-300" : ""}
                        `}>
                          {date.getDate()}
                        </span>
                        {price != null && !isPast && (
                          <span className={`text-[9px] leading-none mt-0.5
                            ${isStart || isEnd ? "text-blue-200" : "text-blue-500"}
                          `}>
                            ¥{price}
                          </span>
                        )}
                      </div>
                      {isToday && !isStart && !isEnd && (
                        <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部按钮 */}
      <div className="px-4 pb-6 pt-2 border-t border-zinc-100 flex gap-3">
        <button
          type="button"
          onClick={() => {
            // 如果有临时的入住和离店日期，则确认它们
            if (tempStart && tempEnd) {
              onChange(tempStart, tempEnd);
              setTempStart(null);
              setTempEnd(null);
              setSelecting("idle");
              setHoverDate(null);
            }
            // 有有效的日期则关闭组件
            if ((tempStart && tempEnd) || (checkIn && checkOut)) {
              onClose?.();
            }
          }}
          disabled={
            selecting === "start" ||
            (!(tempStart && tempEnd) && !(checkIn && checkOut))
          }
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-40"
        >
          确定
        </button>
      </div>
    </div>
  );
}