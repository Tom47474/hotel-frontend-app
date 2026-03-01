"use client";

interface RatingAndLocationProps {
  rating: number;
  reviewCount: number;
  reviewSnippet?: string;
  address: string;
  distance?: string;
}

export function RatingAndLocation({
  rating,
  reviewCount,
  reviewSnippet,
  address,
  distance,
}: RatingAndLocationProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4 bg-white border-t border-zinc-100">
      <div className="p-3 rounded-lg bg-blue-50/80">
        <p className="text-2xl font-bold text-blue-600">{rating || "-"}</p>
        <p className="text-xs text-zinc-600 mt-0.5">
          超棒 {reviewCount}条 &gt;
        </p>
        {reviewSnippet && (
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
            &quot;{reviewSnippet}&quot;
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg bg-zinc-50">
        {distance && (
          <p className="text-sm font-medium text-zinc-900">{distance}</p>
        )}
        <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{address}</p>
        <p className="text-blue-600 text-xs mt-2 flex items-center gap-1">
          <span>📍</span> 地图
        </p>
      </div>
    </div>
  );
}
