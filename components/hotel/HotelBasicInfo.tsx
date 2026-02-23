"use client";

import { FacilityIcon } from "../common/FacilityIcon";


function StarDisplay({ star }: { star: number | null }) {
  if (star == null) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500 text-base">
      {"★".repeat(star)}
    </span>
  );
}

interface HotelBasicInfoProps {
  name: string;
  star: number | null;
  openingDate: string | null;
  facilities: string[];
}

export function HotelBasicInfo({
  name,
  star,
  openingDate,
  facilities,
}: HotelBasicInfoProps) {
  const year = openingDate ? new Date(openingDate).getFullYear() : null;

  console.log("year-->", year);
  console.log("star-->", star);
  console.log("openingDate-->", openingDate);
  console.log("facilities-->", facilities);
  console.log("name-->", name);

  return (
    <section className="px-4 py-4 bg-white">
      <div className="flex items-start gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 flex-1">{name}</h2>
        <div className="flex flex-shrink-0 gap-1.5">
          {year && (
            <span className="px-2 py-0.5 text-xs border border-amber-200 text-amber-700 rounded">
              {year}年开业
            </span>
          )}
        </div>
      </div>
      <div className="mt-1.5">
        <StarDisplay star={star} />
      </div>
      {facilities?.length > 0 && (
        <div className="mt-4 flex items-stretch w-full">
          {/* 左侧：可横向滚动的设施图标 */}
          <div className="flex overflow-x-auto scrollbar-hide gap-3 flex-1 min-w-0">
            {facilities.slice(0, 6).map((f) => (
              <div key={f} className="flex flex-col items-center flex-shrink-0 min-w-[56px]">
                <FacilityIcon name={f} className="mb-1" size={28} />
                <span className="text-xs text-zinc-600 text-center">{f}</span>
              </div>
            ))}
          </div>
          {/* 右侧：固定不动的设施政策 */}
          <a
            href="#"
            className="flex flex-col items-center justify-center flex-shrink-0 pl-4 min-w-[56px] text-zinc-500"
          >
            <span className="text-lg mb-1">›</span>
            <span className="text-xs">设施政策</span>
          </a>
        </div>
      )}
    </section>
  );
}
